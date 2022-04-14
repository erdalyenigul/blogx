<template>
  <div class="content">
    <h1 class="headline">New post</h1>
    <div class="coverImg">
      <button @click="$refs.fileInput.click()" type="file" class="button primaryBtn">Cover image</button>
      <div class="loading" v-if="loading">
        <img src="@/assets/images/loader.gif" alt="">
      </div>
      <img :src="coverImg" />
    </div>
    <form @submit.prevent="newPostSubmit" class="newPostForm">
      <div class="nameInput">
        <input type="text" placeholder="Headline" @blur="nameSet($event)" />
      </div>
      <div class="editorWrap">
        <div
          class="quill-editor"
          :content="content"
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
import "firebase/firestore";
import { getUserFromCookie, getUserFromSession } from "@/helpers";

export default {
  asyncData({ req, redirect }) {
    if (process.server) {
      const user = getUserFromCookie(req);
      if (!user) {
        redirect("/login");
      }
    } else {
      var user = firebase.auth().currentUser;
      if (!user) {
        redirect("/login");
      }
    }
  },
  data() {
    return {
      loading: false,
      coverImg: "",
      createDate: "",
      postID: "",
      name: "",
      content: "",
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
            ["blockquote", "link", "image", "video"],
            [{ color: [] }, { background: [] }]
          ]
        }
      }
    };
  },
  methods: {
    onEditorChange({ editor, html, text }) {
      this.content = html;
    },
    nameSet(e) {
      this.name = e.target.value;
    },
    newPostSubmit() {
      firebase
        .firestore()
        .collection("blogData")
        .add({
          name: this.name,
          info: this.content,
          postID: this.postID,
          createDate: this.createDate.slice(0, -3)
        })
        .then(docRef => this.$router.push({ name: "database" }))
        .catch(error => console.log(error));
    },
    uploadImage(e) {
      this.loading = true;
      let storageRef = firebase.storage().ref(this.postID);

      if (e.target.files[0]) {
        storageRef.delete().then(function() {}).catch(function(error) {});
        let file = e.target.files[0];
        let uploadTask = storageRef.put(file);
        uploadTask.on("state_changed", snapshot => {},
          error => {
            console.log(error);
          }, () => {
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              this.coverImg = downloadURL;
              this.loading = false;
            });
          }
        );
      }
    }
  },
  mounted() {
    this.postID = new Date().getTime().toString(36) + Date.now().toString().split(".").join("_");
    var today = new Date();
    var date = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    this.createDate = date + " " + time;
  }
};
</script>