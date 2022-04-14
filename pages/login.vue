<template>
  <div class="content">
    <h1 class="headline center">Login</h1>
    <form class="loginForm" @submit.prevent="pressed">
      <div>
        <input type="text" placeholder="E-mail" v-model="email">
      </div>
      <div>
        <input type="password" placeholder="Password" v-model="password">
      </div>
      <button class="button primaryBtn">Login</button>
      <div class="error" v-if="error">{{ error.message }}</div>
    </form>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
    }
  },
  methods: {
    pressed() {
      firebase.auth().signInWithEmailAndPassword(this.email, this.password).then(data => {
        this.$router.push('/database');
      }).catch(error => this.error = error)
    }
  }
}
</script>