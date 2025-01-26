import { defineStore } from 'pinia';

export const useDialogStore = defineStore('dialogStore', {
  state: () => ({
    showDialog: false,
    dialogTitle: '',
    dialogMessage: '',
    okButtonText: 'OK',
    cancelButtonText: 'Abbrechen',
    okButtonClass:'btn-primary',
    cancelButtonClass:'btn-secondary',
    okFunction: null
  }),

  getters: {
    isShowDialog: (state) => !!state.showDialog,
  },

  actions: {
    setParameter (title,message,okButtonText,okButtonClass,cancelButtonText,cancelButtonClass,okFunction) {
      this.dialogTitle = title;
      this.dialogMessage = message;
      this.okButtonText = okButtonText;
      this.okButtonClass = okButtonClass;
      this.cancelButtonText = cancelButtonText;
      if (cancelButtonClass) {
        this.cancelButtonClass = cancelButtonClass;
      }
      this.okFunction = okFunction;
      this.showDialog = true;
    },
  },
});
