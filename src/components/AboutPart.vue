<script setup lang="ts">
function sourceLink() {
  return "https://reddit.zendesk.com/hc/en-us/articles/360043043412-What-is-a-custom-feed-and-how-do-I-make-one-";
}
</script>
<template>
  <div class="about container">
    <Divider />
    <Panel header="What is this webpage for?" :toggleable="true">
      <p>
        Provide a simple UI where you can add and remove multiple subreddits to
        multiple custom feeds in bulk at the same time instead of one by one
        editing options provided by reddit.
      </p>
    </Panel>

    <Divider />
    <Panel header="What are custom feeds / multireddits?" :toggleable="true">
      <p>
        Custom feeds a.k.a Multireddits are feeds redditors make themselves that
        have multiple communities in one feed. Custom feeds are great for
        grouping communities that are about the same topic. For example, you can
        group r/A24, r/movies, and r/criterion under a custom title Movies, or
        r/gaming, r/leagueoflegends, and r/Minecraft under Gaming. You can keep
        your custom feeds private for your own use, or make them public to share
        <a :href="sourceLink()" target="_blank">(source)</a>.
      </p>
    </Panel>

    <Divider />
    <Panel header="Official way to update custom feeds" :toggleable="true">
      <p>
        Using the official way to update custom feeds one subreddit at the time
        <a :href="sourceLink()" target="_blank">(source)</a>.
      </p>

      <h5>On reddit.com</h5>
      <ol>
        <li>
          Visit a community that you’d like to include in a custom feed. On the
          right-hand side of the page, you’ll see a Community Details box. Click
          the … overflow menu in the top right of the box.
        </li>
        <li>Select Add To Custom Feed then choose Create A Custom Feed.</li>
        <li>Give your feed a name and hit Create.</li>
        <li>
          Last, select the custom feed you just made and click update to add the
          community to the feed.
        </li>
      </ol>

      <h5>On old.reddit.com</h5>
      <ol>
        <li>Click on the thin gray bar on the left edge of the home page.</li>
        <li>From the menu, select create under multireddits.</li>
        <li>Give your custom feed a name and click create.</li>
        <li>
          You’ll be taken to a page when you can search for and add communities.
        </li>
      </ol>

      <h5>On the iOS and Android apps</h5>
      <ol>
        <li>
          Tap on the drop-down menu from the upper left-hand corner of your home
          screen.
        </li>
        <li>Scroll down and select Custom Feeds.</li>
        <li>Create a new custom feed by giving it a name.</li>
        <li>Search for and add communities to your new feed.</li>
      </ol>
    </Panel>
    <Divider />
  </div>
</template>

<style scoped>
.about {
  text-align: justify;
}
</style>
