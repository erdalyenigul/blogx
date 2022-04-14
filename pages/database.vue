<template>
  <div class="content">
    <div class="modalWrap" v-if="modal">
      <div class="modalContent">
        <div @click="closeModal()" class="modalClose">
          <font-awesome-icon icon="times-circle" />
        </div>
        <div class="headline center">Confirm delete</div>
        <div class="middle">
          <button class="button primaryBtn" @click="closeModal()">Cancel</button>
          <button class="button errorBtn" @click="deleteModalOkay()">Delete</button>
        </div>
      </div>
    </div>
    <div class="adminInfo">
      <div class="welcome">Welcome <span>{{ adminEmail }}</span></div>
      <nuxt-link class="newPost" :to="{ name: 'newPost' }">Yazı oluştur</nuxt-link>
    </div>
    <div v-if="showData" class="posts" v-for="(post, index) in posts" :key="post.id">
      <div class="imgCover">
        <nuxt-link
          :to="{ name:'posts-postID', params: { postID: post.postID } }"
        ><img :src="post.img" :alt="post.name" /></nuxt-link>
      </div>
      <div class="Infos infoList">
        <nuxt-link
          class="postName"
          :to="{ name:'posts-postID', params: { postID: post.postID } }"
        >{{ post.name.split(' ').slice(0,15).join(' ') }}</nuxt-link>
        <div class="postDate">Date: {{ post.createDate.slice(0, -3) }}</div>
        <div class="postInfo" v-html="post.info.split(' ').slice(0, 16).join(' ') + ' ...'"></div>
        <nuxt-link
          class="button primaryBtn"
          :to="{ name: 'posts-edit-editPost', params: { editPost: post.postID } }"
        >Edit</nuxt-link>
        <div class="button errorBtn" @click="deletePost(post.postID, index)" v-if="admin">Delete</div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { getUserFromCookie, getUserFromSession } from "@/helpers";

export default {
  data() {
    return {
      posts: [],
      admin: false,
      modal: false,
      postID: "",
      adminEmail: "",
      postIndex: "",
      showData: false
    };
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.admin = true;
        this.adminEmail = user.email.substring(0, user.email.lastIndexOf("@"));
      } else {
        this.admin = false;
      }
    });
  },
  async asyncData({ req, redirect }) {
    if (process.server) {
      const user = getUserFromCookie(req);
      if (!user) {
        console.log("redirecting server");
        redirect("/login");
      }
    } else {
      var user = firebase.auth().currentUser;
      if (!user) {
        redirect("/login");
      }
    }

    let posts = [];
    await firebase
      .firestore()
      .collection("blogData")
      .orderBy("postID", "desc")
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          posts.push(doc.data());
        });
      });
    return { posts: posts }
  },
  methods: {
    deletePost(postID, index) {
      this.modal = true;
      this.postID = postID;
      this.postIndex = index;
    },
    deleteModalOkay() {
      this.modal = false;
      firebase
        .firestore()
        .collection("blogData")
        .where("postID", "==", this.postID)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            doc.ref.delete();
            this.posts.splice(this.postIndex, 1);
          });
        });
    },
    closeModal() {
      this.modal = false;
    },
    async downloadImg() {
      var self = this;
      for (var i = 0; i < self.posts.length; i++) {
        await firebase.storage().ref(self.posts[i].postID)
          .getDownloadURL()
          .then(function(url) {
            self.posts[i].img = url;
          })
          .catch(function(error) {
            console.log(error)
          });
      }
      this.showData = true;
    }
  },
  mounted() {
    this.downloadImg();
  }
};
</script>