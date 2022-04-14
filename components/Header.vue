<template>
  <div class="header">
    <div class="headerContent">
      <div class="logo">
        <nuxt-link to="/">
          <font-awesome-icon icon="comment-alt" />
          <span>BlogX</span>
        </nuxt-link>
      </div>
      <a href="#" class="mobileMenuBtn" @click="openMobileMenu">
        <font-awesome-icon icon="bars" />
      </a>
    </div>
    <ul :class="{ openMenu: menuList }">
      <li v-if="loggedIn">
        <nuxt-link to="/">Anasayfa</nuxt-link>
      </li>
      <li v-if="loggedIn">
        <nuxt-link :to="{ name: 'database' }">Admin</nuxt-link>
      </li>
      <li v-if="loggedIn">
        <a href @click="logout">Çıkış</a>
      </li>
      <li v-if="!loggedIn">
        <nuxt-link :to="{ name: 'login' }">Admin</nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import Cookies from "js-cookie";

export default {
  mounted() {
    this.setupFirebase();
  },
  data() {
    return {
      loggedIn: false,
      userEmail: "",
      menuList: false
    };
  },
  methods: {
    openMobileMenu() {
      this.menuList = !this.menuList;
    },
    setupFirebase() {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.loggedIn = true;
          firebase
            .auth()
            .currentUser.getIdToken(true)
            .then(token => {
              Cookies.set("access_token", token);
            });
          this.userEmail = firebase.auth().currentUser.email;
        } else {
          this.loggedIn = false;
          Cookies.remove("access_token");
        }
      });
    },
    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.push("/");
        });
    }
  },
  watch: {
    $route() {
      this.menuList = false;
    }
  }
};
</script>