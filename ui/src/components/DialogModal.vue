<template>
<!-- Modal -->
<div class="modal fade" id="globalModalDialog" tabindex="-1" aria-labelledby="globalModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="globalModalLabel">{{ title }}</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body" v-html="message">
      </div>
      <div class="modal-footer">
        <button v-if="textButtonCancel !== ''" type="button" class="btn" :class="classButtonCancel" data-bs-dismiss="modal">{{ textButtonCancel }}</button>
        <button type="button" class="btn" :class="classButtonOK" @click="clickButtonOk" data-bs-dismiss="modal">{{ textButtonOK }}</button>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
  import { ref } from 'vue';
  import { useDialogStore } from '@/stores/dialogStore';
  import { onMounted } from 'vue';
  import { watch } from 'vue';
  // import 'bootstrap/dist/css/bootstrap.min.css';
  import * as bootstrap from 'bootstrap';

  const dialogStore = useDialogStore();
  let myModal;
  const title = ref('');
  const message = ref('');
  const textButtonOK = ref('');
  const textButtonCancel = ref('');
  const classButtonOK = ref('btn-primary');
  const classButtonCancel = ref('btn-secondary');
  let okFunction;

  const clickButtonOk = function () {
    if (typeof okFunction === 'function') {
      okFunction();
    }
  }

  onMounted(async () => {
    myModal = new bootstrap.Modal(document.getElementById('globalModalDialog'));
  });

  watch(
    () => dialogStore.showDialog, (newValue) => {
      if (newValue) {
        title.value = dialogStore.dialogTitle;
        message.value = dialogStore.dialogMessage;
        textButtonOK.value = dialogStore.okButtonText;
        textButtonCancel.value = dialogStore.cancelButtonText;
        if (dialogStore.okButtonClass) {
          classButtonOK.value = dialogStore.okButtonClass;
        } else {
          classButtonOK.value = 'btn-primary';
        }
        if (dialogStore.cancelButtonClass) {
          classButtonCancel.value = dialogStore.cancelButtonClass;
        } else {
          classButtonCancel.value = 'btn-secondary';
        }
        okFunction = dialogStore.okFunction;
        myModal.show();
        dialogStore.showDialog = false;

      }
    }
  );

</script>

<style scoped>
</style>
