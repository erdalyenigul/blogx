<template>
  <div class="content">
    <h1 class="headline">Edit post</h1>
    <div class="coverImg">
      <button @click="$refs.fileInput.click()" type="file" class="button primaryBtn">Cover image</button>
      <div class="loading" v-if="loading">
        <img src="@/assets/images/loader.gif" alt="">
      </div>
      <img :src="coverImg" />
    </div>
    <form @submit.prevent="editPost" class="newPostForm">
      <div class="nameInput">
        <input type="text" placeholder="Headline" :value="post.name" @blur="nameSet($event)" />
      </div>
      <div class="editorWrap">
        <div 
          class="quill-editor"
          :content="post.info"
          @change="onEditorChange($event)"
          v-quill:myQuillEditor="editorOption"
        ></div>
      </div>
      <button type="submit" class="button primaryBtn">Save</button>
    </form>
    <input type="file" @change="uploadImage($event)" ref="fileInput" class="fileUploadInput" />
  </div>
</template>
 
<script>
import firebase from "firebase/app";
import "firebase/auth";
import 'firebase/firestore';
import { getUserFromCookie, getUserFromSession } from '@/helpers';

export default {
  async asyncData ({ req, redirect, route }) {
    if (process.server) {
      const user = getUserFromCookie(req)
      if (!user) {
        redirect('/login');
      }
    } else {
      var user = firebase.auth().currentUser
      if (!user) {
        redirect('/login');
      }
    }

    let post = [];
    await firebase
      .firestore()
      .collection("blogData")
      .where("postID", "==", route.params.editPost)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          post = doc.data();
        });
      });
      return { post: post }
  },
  data() {
    return {
      loading: false,
      coverImg: "",
      post: [],
      postID: "",
      postInfo: "",
      editorOption: {
        modules: {
          toolbar: [
            [
              { size: ["normal", "large", "huge"] },
              "bold",
              "italic",
              "underline",
              "strike"
            ],
            ['clean'],
            ["blockquote", "link", "image", "video"],
            [{ 'color': [] }, { 'background': [] }], 
          ]
        }
      }
    };
  },
  methods: {
    onEditorChange({ editor, html, text }) {
      this.postInfo = html;
    },
    nameSet(e) {
      this.post.name = e.target.value;
    },
    editPost() {
      firebase
        .firestore()
        .collection("blogData")
        .where("postID", "==", this.$route.params.editPost)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            doc.ref.update({
              postID: this.$route.params.editPost,
              name: this.post.name,
              info: this.postInfo
            })
            .then(() => {
              this.$router.push({ name: 'posts-postID', params: {postID: this.$route.params.editPost} })
            })
          });
        });
    },
    uploadImage(e) {
      this.loading = true;
      let storageRef = firebase.storage().ref(this.postID);

      if (e.target.files[0]) {
        storageRef.delete().then(function() {
        }).catch(function(error) {});
      
        let file = e.target.files[0];
        let uploadTask = storageRef.put(file);
        uploadTask.on(
          "state_changed",
          snapshot => {},
          error => {
            console.log(error);
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              this.coverImg = downloadURL;
              this.loading = false;
            });
          }
        );
      }
    },
    async coverImgPreview() {
      var self = this;
      await firebase
        .storage()
        .ref(this.$route.params.editPost)
        .getDownloadURL()
        .then(function(url) {
          self.coverImg = url;
        })
        .catch(function(error) {
          console.log(error.message);
        });
      this.showData = true;
    }
  },
  mounted() {
    this.coverImgPreview();
  }
};
</script>