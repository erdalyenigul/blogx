<template>
  <div class="content">
    <div class="modalWrap" v-if="modal">
      <div class="modalContent">
        <div @click="closeModal()" class="modalClose">
        </div>
        <div class="headline center">Confirm delete</div>
        <div class="middle">
          <button class="button primaryBtn" @click="closeModal()">Cancel</button>
          <button class="button errorBtn" @click="deleteModalOkay()">Delete</button>
        </div>
      </div>
    </div>
    <div class="adminLine" v-if="admin">
      <nuxt-link
        class="button primaryBtn"
        :to="{ name: 'posts-edit-editPost', params: { editPost: $route.params.postID } }"
      >Edit</nuxt-link>
      <button class="button errorBtn" @click="deletePost">Delete</button>
    </div>
    <div class="posts">
      <h1 class="postName pnDetail">{{ post.name }}</h1>
      <div class="postDate">Oluşturulma tarihi: {{ post.createDate }}</div>
      <img class="detailImgCover" :src="img" :alt="post.name" />
      <h2 class="postInfo" v-html="post.info"></h2>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";

export default {
  data() {
    return {
      admin: false,
      modal: false,
      img: "",
      post: []
    };
  },
  async asyncData({ route }) {
    let post = [];
    await firebase
      .firestore()
      .collection("blogData")
      .where("postID", "==", route.params.postID)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          post = doc.data();
        });
      });
      return { post: post }
  },
  methods: {
    deletePost() {
      this.modal = true;
    },
    deleteModalOkay() {
      this.modal = false;

      //IMG delete
      firebase.storage().ref(this.postID).delete().then(function() {
      }).catch(function(error) {});

      //Content Delete
      firebase
        .firestore()
        .collection("blogData")
        .where("postID", "==", this.postID)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            doc.ref.delete();
            this.$router.push({ name: 'database' });
          });
        });
    },
    closeModal() {
      this.modal = false;
    },
    downloadImg() {
      let self = this;
      firebase
        .storage()
        .ref(this.$route.params.postID)
        .getDownloadURL()
        .then(function(url) {
          self.img = url;
        })
        .catch(function(error) {
          console.log(error.message);
        });
      this.showData = true;
    },
    async userAuth() {
      await firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.admin = true;
        } else {
          this.admin = false;
        }
      });
    }
  },
  mounted() {
    this.userAuth();
    this.downloadImg();
  }
};
</script>