import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import SiteLayout from "./components/SiteLayout";
import StaticAbout from "./pages/StaticAbout";
import StaticArchives from "./pages/StaticArchives";
import StaticHome from "./pages/StaticHome";
import StaticNote from "./pages/StaticNote";
import StaticNotFound from "./pages/StaticNotFound";
import StaticPosts from "./pages/StaticPosts";
import StaticTags from "./pages/StaticTags";

export default function App() {
  return <Router hook={useHashLocation}><SiteLayout><Switch>
    <Route path="/" component={StaticHome} />
    <Route path="/posts" component={StaticPosts} />
    <Route path="/notes/:slug" component={StaticNote} />
    <Route path="/archives" component={StaticArchives} />
    <Route path="/tags" component={StaticTags} />
    <Route path="/about" component={StaticAbout} />
    <Route component={StaticNotFound} />
  </Switch></SiteLayout></Router>;
}
