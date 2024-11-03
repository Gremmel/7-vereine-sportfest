<template>
  <div class="DialogModal">
    <div id="dialogModal" class="modal fade" tabindex="-1" aria-labelledby="dialogModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="dialogModalLabel" class="modal-title">
              {{ title }}
            </h5>
            <button v-show="modalOptions.backdrop !== 'static'" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>

          <div class="modal-body">
            <template v-if="type === 'multiple'">
              <div v-for="(message, messageIndex) in messages" :key="`message_${messageIndex}`" class="card" :class="[ `border-${message.type}`, messageIndex < messages.length -1 ? 'mb-3' : '' ]">
                <div class="card-body" :class="[ `text-${message.type}`, `text-${textAlign}` ]" style="position: relative;">
                  <button v-if="message.close" type="button" class="btn-close" aria-label="Close" style="position: absolute; right: 0.4rem; top: 0.4rem;" @click="delMessage(messageIndex)" />
                  <h5 v-if="message.title" class="card-title">
                    {{ message.title }}
                  </h5>
                  <h6 v-if="message.subtitle" class="card-subtitle mb-2 text-muted">
                    {{ message.subtitle }}
                  </h6>
                  <div v-if="message.html" v-html="message.html" />
                  <p v-else-if="message.text" class="card-text">
                    {{ message.text }}
                  </p>
                  <div v-if="message.buttons" class="text-end">
                    <button
                      v-for="(button, buttonIndex) in message.buttons"
                      :key="`message_${messageIndex}_button_${buttonIndex}`"
                      type="button"
                      class="btn"
                      :class="[ `btn-${button.type}` ]"
                      @click="button.function(); delMessage(messageIndex, !!button.closeMsg)"
                    >
                      {{ button.text }}
                    </button>
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="type === 'single'">
              <div :class="[`text-${messages[0].type}`, `text-${textAlign}` ]">
                <div v-if="messages[0].html" v-html="messages[0].html" />
                <p v-else-if="messages[0].text" class="card-text">
                  {{ messages[0].text }}
                </p>
              </div>
            </template>
          </div>
          <div class="modal-footer">
            <button
              v-for="(button, buttonIndex) in buttons"
              :key="`button_${buttonIndex}`"
              type="button"
              class="btn"
              :class="[ `btn-${button.type}` ]"
              :data-bs-dismiss="button.closeModal ? 'modal': ''"
              @click="button.function"
            >
              {{ button.text }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap';

// import { nextTick } from 'vue';
// import 'lodash';

export default {
  name: 'DialogModal',
  props: {
  },
  /* sockets: {
    connect () {
      console.log('socket DialogModal connected');
    }
  }, */
  emits: [ ],
  data () {
    return {
      dialogModal: null,
      shown: false,
      showInProgress: false,
      title: '',
      messages: [],
      buttons: [],
      modalOptions: {
        backdrop: true,
        keyboard: true
      },
      type: '',
      ref: '',
      textAlign: 'center',
      queue: []
    };
  },
  computed: {
  },
  watch: {
    messages: {
      deep: true,
      handler (val) {
        if (val.length === 0) {
          this.dialogModal.hide();
        }
      }
    }
  },
  mounted () {
    console.log('DialogModal mounted');

    const modalEl = document.getElementById('dialogModal');

    this.dialogModal = new Modal(modalEl, {
      // keyboard: false
    });
    modalEl.addEventListener('hidden.bs.modal', () => {
      this.shown = false;
      this.messages.splice(0);
      this.buttons.splice(0);
      this.title = '';
      this.backdrop = true;
      this.keyboard = true;
      this.ref = '';
      this.type = '';
      this.textAlign = 'center';
      this.onHidden();
    });
    modalEl.addEventListener('shown.bs.modal', () => {
      this.shown = true;
      this.showInProgress = false;
    });
    modalEl.addEventListener('show.bs.modal', () => {
      this.showInProgress = true;
    });
  },
  methods: {
    dialogModalFunc (opts) {
      if (opts) {
        let set = false;

        if (opts.function === 'setMessages') {
          if (this.shown) {
            this.queue.push(opts);

            return;
          }
          this.messages.splice(0);
          set = true;
          if (!this.shown) {
            this.type = 'multiple';
          }
        } else if (opts.function === 'addMessages') {
          if (this.shown && this.type === 'single') {
            this.queue.push(opts);

            return;
          }
          set = true;
          if (!this.shown) {
            this.type = 'multiple';
          }
        } else if (opts.function === 'setMessage') {
          if (this.shown) {
            this.queue.push(opts);

            return;
          }
          this.messages.splice(0);
          set = true;
          if (!this.shown) {
            this.type = 'single';
          }
        } else if (opts.function === 'close') {
          if (!opts.ref) {
            this.dialogModal.hide();

            return;
          }
          let i = 0;

          while (i < this.queue.length) {
            if (this.queue[i].ref === opts.ref) {
              this.queue.splice(i, 1);
            } else {
              i += 1;
            }
          }

          return;
        } else if (opts.function === 'delMessages') {
          if (this.queue.length > 0) {
            this.queue.push(opts);

            return;
          }
          if (Array.isArray(opts.messages) && this.type === 'multiple') {
            for (const message of opts.messages) {
              if (message.ref !== undefined && message.ref !== null) {
                let i = 0;

                while (i < this.messages.length) {
                  if (this.messages[i].ref === message.ref) {
                    this.messages.splice(i, 1);
                  } else {
                    i += 1;
                  }
                }
              }
            }
          }

          return;
        } else if (opts.function === 'getState') {
          return {
            options: {
              title: this.title,
              staticBackdrop: this.modalOptions.backdrop === 'static',
              ref: this.ref,
              type: this.type,
              messages: this.messages,
              buttons: this.buttons
            },
            modal: {
              shown: this.shown
            }
          };
        }

        if (set) {
          if (opts.title || opts.title === '') {
            this.title = opts.title;
          }

          if (opts.textAlign || opts.textAlign === '') {
            this.textAlign = opts.textAlign;
          }

          if (this.type === 'multiple' && Array.isArray(opts.messages)) {
            for (const message of opts.messages) {
              if (message.type) {
                //
              } else if (opts.type) {
                message.type = opts.type;
              } else {
                message.type = 'dark';
              }

              if (Array.isArray(message.buttons)) {
                const buttons = [];

                for (const button of message.buttons) {
                  if (!button.type) {
                    button.type = `dark`;
                  }
                  buttons.push(button);
                }
                message.buttons = buttons;
              }
              this.messages.push(message);
            }
          }

          if (this.type === 'single') {
            const message = {};

            message.html = opts.html;
            message.text = opts.text;

            if (opts.type) {
              message.type = opts.type;
            } else {
              message.type = 'dark';
            }

            this.messages.push(message);
          }

          if (Array.isArray(opts.buttons)) {
            this.buttons.splice(0);
            for (const button of opts.buttons) {
              if (!button.type) {
                button.type = `dark`;
              }
              this.buttons.push(button);
            }
          }

          if (!this.shown) {
            if (opts.staticBackdrop === true) {
              this.modalOptions.backdrop = 'static';
            } else {
              this.modalOptions.backdrop = true;
            }
            if (typeof opts.keyboard === 'boolean') {
              this.modalOptions.keyboard = opts.keyboard;
            } else {
              this.modalOptions.keyboard = true;
            }

            if (opts.ref !== null && opts.ref !== undefined) {
              this.ref = opts.ref;
            } else {
              this.ref = '';
            }

            if (!this.shown && !this.showInProgress) {
              this.dialogModal = new Modal(document.getElementById('dialogModal'), this.modalOptions);
              this.dialogModal.show();
            }
          }
        }
      }
    },
    onHidden () {
      if (this.queue && this.queue.length > 0) {
        let firstFunc = ''; // setMessages, addMessages, setMessage

        while (this.queue.length > 0) {
          if ((((firstFunc === 'setMessages') || (firstFunc === 'addMessages')) && this.queue[0].function === 'setMessage') ||
              (firstFunc === 'setMessage')) {
            break;
          }
          const opts = this.queue.shift();

          this.dialogModalFunc(opts);

          if (firstFunc === '') {
            firstFunc = opts.function;
          }
        }
      }
    },
    delMessage (index, doDelete) {
      if (doDelete === false) {
        return;
      }
      this.messages.splice(index, 1);
    }
  }
};

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .clickable {
    cursor: pointer !important;
  }
</style>
