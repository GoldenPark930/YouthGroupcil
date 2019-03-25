<template>
  <div class="container">
    <div class="row">
      <div class="col-lg-4">

        <div
          class="card"
          v-if="currentUser"
        >
          <div class="card-header">
            <h3 class="card-title">{{ $t('title.my-profile') }}</h3>
          </div>
          <div class="card-body">
            <form>
              <div class="row">
                <div class="col-auto">
                  <span
                    class="avatar avatar-xl"
                    :style="avatar"
                  ></span>
                </div>
                <div class="col">
                  <div class="form-group">
                    <label class="form-label">{{ $t('labels.email') }}</label>
                    <input
                      class="form-control"
                      :class="{ 'is-invalid': errors.email }"
                      placeholder=""
                      v-model="currentUser.email"
                    />
                    <div
                      v-if="errors.email"
                      class="invalid-feedback"
                    >{{ errors.email.join(', ') }}</div>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">{{ $t('labels.client-name') }}</label>
                <input
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder=""
                  v-model="currentUser.name"
                />
                <div
                  v-if="errors.name"
                  class="invalid-feedback"
                >{{ errors.name.join(', ') }}</div>
              </div>

              <div class="form-group">
                <label class="form-label">{{ $t('labels.password') }}</label>
                <input
                  type="password"
                  :class="{ 'is-invalid': errors.password }"
                  class="form-control"
                  v-model="password"
                />
                <div
                  v-if="errors.password"
                  class="invalid-feedback"
                >{{ errors.password.join(', ') }}</div>
              </div>

              <div
                class="form-group"
                v-if="password.length > 0"
              >
                <label class="form-label">{{ $t('labels.confirm-password') }}</label>
                <input
                  type="password"
                  class="form-control"
                  v-model="confirm_password"
                />
              </div>

              <div class="form-footer">
                <button
                  class="btn btn-primary btn-block"
                  :disabled="loading"
                  type="button"
                  @click="updateProfile"
                >{{ $t('actions.save') }}</button>
              </div>
            </form>
          </div>
        </div>

      </div>

      <div class="col-lg-8">
        <form class="card">

          <div
            class="dimmer"
            :class="{ 'active': loading }"
          >
            <div
              class="loader"
              v-show="loading"
            ></div>
            <div
              class="dimmer-content"
              :class="{'min-height-300': loading}">

              <div class="card-body">
                <h3 class="card-title">{{ $t('menu.settings') }}</h3>

                <div class="row">
                  <div class="col">

                    <div
                      class="form-group"
                      v-for="(email, index) in emails"
                      :key="index">

                      <label class="form-label">{{ $t('labels.email') }} (CC) {{ (index + 1) }}</label>

                      <div class="row gutters-xs">
                        <div class="col">
                          <input
                            type="text"
                            class="form-control"
                            v-model="email.value"
                          />
                        </div>
                        <span
                          class="col-auto"
                          v-if="emails.length > 1">
                          <button
                            type="button"
                            @click="remove(email, index)"
                            class="btn btn-danger"
                          >{{ $t('actions.remove') }}</button>
                        </span>
                      </div>

                      <div
                        v-if="errors[`emails.${index}.value`]"
                        class="invalid-feedback"
                      >{{ errors[`emails.${index}.value`].join(', ') }}</div>
                    </div>

                  </div>
                </div>

                <div class="row">
                  <div class="col">

                    <!-- Doc 1 -->
                    <div class="form-group">

                      <label class="form-label">{{ $t('labels.document-1') }}</label>
                      <input class="form-control"
                        name="doc1"
                        type="text"
                        placeholder=""
                        v-bind:class="{ 'is-invalid': errors.doc1 }"
                        v-model="doc1" />

                      <div v-if="errors.doc1"
                        class="invalid-feedback">{{ errors.doc1.join(', ') }}</div>

                    </div>

                    <!-- Doc 2 -->
                    <div class="form-group">

                      <label class="form-label">{{ $t('labels.document-2') }}</label>
                      <input class="form-control"
                        name="doc2"
                        type="text"
                        placeholder=""
                        v-bind:class="{ 'is-invalid': errors.doc2 }"
                        v-model="doc2" />

                      <div v-if="errors.doc2"
                        class="invalid-feedback">{{ errors.doc2.join(', ') }}</div>
                      
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          <div class="card-footer text-right">
            <button
              class="btn btn-primary"
              :disabled="loading"
              type="button"
              @click="newEmail()"
            >{{ $t('actions.add-email') }}</button>
            <button
              class="btn btn-primary"
              :disabled="loading"
              type="button"
              @click="updateSettings"
            >{{ $t('actions.update') }}</button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data: function() {
    return {
      errors: [],
      loading: false,

      password: "",
      confirm_password: "",

      // Settings
      emails: [],
      doc1: "",
      doc2: ""
    };
  },

  created() {
    this.list();
  },

  computed: {
    ...mapGetters({
      currentUser: "currentUser"
    }),

    avatar: function() {
      return `background-image: url(${this.currentUser.avatar})`;
    }
  },

  methods: {
    list() {
      this.loading = true;

      axios
        .get(`/api/settings`)
        .then(response => {
          if (response.data["mails-copy"] === null) {
            return false;
          }

          this.emails = Object.values(response.data["mails-copy"]).map(x => {
            return { value: x };
          });

          this.doc1 = response.data.doc1;
          this.doc2 = response.data.doc2;

          this.loading = false;
        })
        .catch(e => {
          if (e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else {
            this.$notify({ group: "app", type: "error", text: e.message });
          }
        });
    },

    updateProfile() {

      this.loading = true;

      axios
        .put(`/api/users/${this.currentUser.id}`, {
          name: this.currentUser.name,
          email: this.currentUser.email,
          password: this.password,
          password_confirmation: this.confirm_password
        })
        .then(response => {
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t("notifications.record-updated")
          });

          // Clear password
          this.password = "";
          this.confirm_password = "";

          this.loading = false;
        })
        .catch(e => {
          if (e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else {
            this.$notify({ group: "app", type: "error", text: e.message });
          }

          this.loading = false;
        });
    },

    updateSettings() {

      this.loading = true;
      
      axios
        .post(`/api/settings`, {
          "mails-copy": this.emails,
          'doc1': this.doc1,
          'doc2': this.doc2
        })
        .then(response => {
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t("notifications.record-updated")
          });

          this.loading = false;
        })
        .catch(e => {
          if (e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else {
            this.$notify({ group: "app", type: "error", text: e.message });
          }

          this.loading = false;
        });
    },

    remove(email, index) {
      this.emails.splice(index, 1);
    },

    newEmail() {
      this.emails.push({
        value: ""
      });
    }
  }
};
</script>
