<template>
  <div class="content">
    <div v-if="showData" class="posts" v-for="post in posts" :key="post.id">
      <div class="imgCover">
        <nuxt-link
          :to="{ name:'posts-postID', params: { postID: post.postID } }"
        ><img :src="post.img" :alt="post.name" /></nuxt-link>
      </div>
      <div class="Infos infoList">
        <nuxt-link
          class="postName"
          :to="{ name:'posts-postID', params: { postID: post.postID } }"
        ><h1>{{ post.name.split(' ').slice(0,15).join(' ') }}</h1></nuxt-link>
        <div class="postDate">Date: {{ post.createDate.slice(0, -3) }}</div>
        <h2 class="postInfo" v-html="post.info.split(' ').slice(0,16).join(' ') + ' ...'"></h2>
        <nuxt-link
          class="button primaryBtn"
          :to="{ name:'posts-postID', params: { postID: post.postID } }"
        ><h1>Detay</h1></nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';

export default {
  data() {
    return {
      posts: [],
      showData: false,
    };
  },
  async asyncData() {
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
    return { posts: posts };
  },
  methods: {
    async downloadImg() {
      let self = this;
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
