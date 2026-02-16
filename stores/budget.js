import { defineStore } from 'pinia'

const API_BASE = '/api';

export const useBudgetStore = defineStore('budget', {
    state: () => ({
        users: [],
        projects: [],
        projectStats: {},
        totalCompanyRetention: 0, // 代表「公司資產」
        companyExpenses: 0,
        otherCompanyIncome: 0,
        transactions: [],
        commonItems: [],

        currentUser: null,
        loading: false,
        isSyncing: false,
        lastUpdated: null,
        error: null,

        // 復原狀態
        lastAddedTxIds: [],
        undoTimer: null,
        showUndoToast: false,
    }),

    getters: {
        // 依日期排序的交易紀錄
        sortedTransactions: (state) => {
            return [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        },

        // 取得特定專案的交易紀錄
        getProjectHistory: (state) => (pid) => {
            return state.transactions.filter(tx => tx.projectId === pid)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        },

        // 取得特定使用者的交易紀錄
        getUserHistory: (state) => (userName) => {
            return state.transactions.filter(tx => tx.relatedUser === userName)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        },

        // 計算所有專案的待收款總額
        totalPendingReceivables: (state) => {
            return state.projects.reduce((sum, p) => {
                const terms = Array.isArray(p.incomeTerms) ? p.incomeTerms : [];
                const projectPending = terms
                    .filter(t => t.status === 'pending')
                    .reduce((termSum, t) => termSum + t.amount, 0);
                return sum + projectPending;
            }, 0);
        },

        // 計算待收款中歸屬公司的保留金額（預期淨值增量）
        totalPendingRetention: (state) => {
            return state.projects.reduce((sum, p) => {
                const terms = Array.isArray(p.incomeTerms) ? p.incomeTerms : [];
                const projectPending = terms
                    .filter(t => t.status === 'pending')
                    .reduce((termSum, t) => termSum + t.amount, 0);

                // 依專案保留比例計算
                const retentionRate = p.retention || 10;
                return sum + Math.floor(projectPending * (retentionRate / 100));
            }, 0);
        },
    },

    actions: {
        // 載入所有資料
        async loadData(silent = false) {
            if (!silent) this.loading = true;
            try {
                const data = await $fetch(`${API_BASE}/init`);
                this.users = data.users || [];
                this.projects = data.projects || [];
                this.projectStats = data.projectStats || {};

                // 公司帳務統計
                this.totalCompanyRetention = data.totalCompanyRetention || 0;
                this.companyExpenses = data.companyExpenses || 0;
                this.otherCompanyIncome = data.otherCompanyIncome || 0;

                this.transactions = data.allTransactions || [];
                this.commonItems = data.commonItems || [];
                this.lastUpdated = new Date();
                this.error = null;

                // 自動登入邏輯
                const userCookie = useCookie('user_name', { maxAge: 60 * 60 * 24 * 365 });
                if (userCookie.value) {
                    const foundUser = this.users.find(u => u.name === userCookie.value);
                    if (foundUser) {
                        this.currentUser = foundUser;
                    }
                } else if (this.currentUser) {
                    // 確認目前使用者仍存在
                    const freshUser = this.users.find(u => u.name === this.currentUser.name);
                    if (freshUser) this.currentUser = freshUser;
                    else this.currentUser = null;
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                this.error = '無法更新資料，請檢查網路連線';
            } finally {
                if (!silent) this.loading = false;
            }
        },

        // 設定使用者
        setUser(user) {
            this.currentUser = user;
            const userCookie = useCookie('user_name', { maxAge: 60 * 60 * 24 * 365 });
            userCookie.value = user.name;
        },

        // 登出
        logout() {
            this.currentUser = null;
            const userCookie = useCookie('user_name');
            userCookie.value = null;
        },

        // 新增交易（含樂觀更新）
        async addTransaction(payload) {
            this.isSyncing = true;
            this.error = null;
            this.showUndoToast = false;
            if (this.undoTimer) clearTimeout(this.undoTimer);

            const tempId = 'temp-' + Date.now();
            const optimisticTxs = payload.items.map((item, idx) => {
                const project = item.projectId ? this.projects.find(p => p.id === item.projectId) : null;

                let subjectDisplay = item.subject || '未分類';
                if (!subjectDisplay.startsWith('[')) {
                    subjectDisplay = `[${subjectDisplay}]`;
                }

                return {
                    id: `${tempId}-${idx}`,
                    date: payload.date,
                    amount: Number(item.amount),
                    type: 'expense',
                    projectId: item.projectId,
                    projectName: project ? project.name : (item.projectId ? 'Unknown' : 'Company'),
                    category: item.branch,
                    item: `${subjectDisplay} ${item.description || ''}`,
                    relatedUser: payload.payer,
                    isIncome: false,
                    note: item.description,
                    status: 'syncing',
                    photoUrl: item.photoUrl,
                    currency: item.currency
                };
            });

            this.transactions.unshift(...optimisticTxs);

            try {
                const body = {
                    action: 'expense',
                    date: payload.date,
                    payer: payload.payer,
                    items: payload.items.map(i => ({
                        ...i,
                        projectId: i.projectId,
                        branch: i.branch,
                        subject: i.subject,
                        description: i.description,
                        amount: i.amount,
                        currency: i.currency,
                        photoUrl: i.photoUrl
                    })),
                    operator: this.currentUser?.name
                };

                const res = await $fetch(`${API_BASE}/transactions`, {
                    method: 'POST',
                    body: body
                });

                if (!res.success) throw new Error(res.message || 'API Error');

                // 成功：儲存 ID 以供復原
                this.lastAddedTxIds = res.transactions.map(t => t.id);

                // 顯示復原提示
                this.showUndoToast = true;
                this.undoTimer = setTimeout(() => {
                    this.showUndoToast = false;
                    this.lastAddedTxIds = [];
                }, 3000);

                // 靜默重新載入以取得正式狀態
                await this.loadData(true);

            } catch (err) {
                console.error('Sync failed:', err);
                this.error = '同步失敗，已還原操作';
                this.transactions = this.transactions.filter(t => !t.id.startsWith(tempId));
                throw err;
            } finally {
                this.isSyncing = false;
            }
        },

        // 復原上一筆交易
        async undoLastTransaction() {
            if (!this.lastAddedTxIds.length) return;

            const ids = [...this.lastAddedTxIds];
            this.showUndoToast = false;
            this.lastAddedTxIds = [];

            // 樂觀移除
            this.transactions = this.transactions.filter(t => !ids.includes(t.id));

            try {
                await Promise.all(ids.map(id => $fetch(`${API_BASE}/transaction/${id}`, { method: 'DELETE' })));
                await this.loadData(true);
            } catch (e) {
                console.error("Undo failed", e);
                this.error = "復原失敗";
                await this.loadData(true);
            }
        },

        // 更新交易
        async updateTransaction(id, payload) {
            try {
                await $fetch(`${API_BASE}/transaction/${id}`, {
                    method: 'PUT',
                    body: payload
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Update failed:', err);
                this.error = '更新失敗';
                throw err;
            }
        },

        // 切換專案歸檔狀態
        async toggleProjectArchive(id, isArchived) {
            try {
                await $fetch(`${API_BASE}/project/${id}`, {
                    method: 'PUT',
                    body: { isArchived }
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Archive failed:', err);
                this.error = '歸檔操作失敗';
                throw err;
            }
        },

        // 新增專案
        async createProject(payload) {
            try {
                await $fetch(`${API_BASE}/projects`, {
                    method: 'POST',
                    body: payload
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Create Project failed:', err);
                this.error = '新增專案失敗';
                throw err;
            }
        },

        // 更新收款期程
        async updateIncomeTerm(id, payload) {
            try {
                const operatorId = this.currentUser?.id;
                await $fetch(`${API_BASE}/income-term/${id}`, {
                    method: 'PUT',
                    body: { ...payload, operatorId }
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Update IncomeTerm failed:', err);
                this.error = '更新收款失敗';
                throw err;
            }
        },

        // 新增收款期程
        async addIncomeTerm(payload) {
            try {
                await $fetch(`${API_BASE}/income-term`, {
                    method: 'POST',
                    body: payload
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Add IncomeTerm failed:', err);
                this.error = '新增收款失敗';
                throw err;
            }
        },

        // 新增預算項目（子專案）
        async addBudgetLine(payload) {
            try {
                // Payload: { projectId, name, budget }
                await $fetch(`${API_BASE}/budget-line`, {
                    method: 'POST',
                    body: payload
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Add BudgetLine failed:', err);
                this.error = '新增預算項目失敗';
                throw err;
            }
        },

        // 更新預算項目
        async updateBudgetLine(id, payload) {
            try {
                await $fetch(`${API_BASE}/budget-line/${id}`, {
                    method: 'PUT',
                    body: payload
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Update BudgetLine failed:', err);
                this.error = '更新預算項目失敗';
                throw err;
            }
        },

        // 刪除預算項目
        async deleteBudgetLine(id) {
            try {
                await $fetch(`${API_BASE}/budget-line/${id}`, {
                    method: 'DELETE'
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Delete BudgetLine failed:', err);
                this.error = '刪除預算項目失敗';
                throw err;
            }
        },

        // 刪除專案
        async deleteProject(id) {
            try {
                await $fetch(`${API_BASE}/projects/${id}`, {
                    method: 'DELETE'
                });
                await this.loadData(true);
            } catch (err) {
                console.error('Delete Project failed:', err);
                this.error = '刪除專案失敗';
                throw err;
            }
        },
    }
});
