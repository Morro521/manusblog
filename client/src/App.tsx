import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BlogLayout from "./components/BlogLayout";
import PostsList from "./pages/PostsList";
import PostDetail from "./pages/PostDetail";
import CreatePost from "./pages/CreatePost";
import Archives from "./pages/Archives";
import TagsPage from "./pages/TagsPage";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import GalleryPage from "./pages/GalleryPage";
import GalleryDetail from "./pages/GalleryDetail";
import PostWorkspace from "./pages/PostWorkspace";
import AuthPage from "./pages/AuthPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/posts" component={PostsList} />
      <Route path="/posts/:slug" component={PostDetail} />
      <Route path="/create" component={CreatePost} />
      <Route path="/edit/:id" component={CreatePost} />
      <Route path="/workspace" component={PostWorkspace} />
      <Route path="/archives" component={Archives} />
      <Route path="/tags" component={TagsPage} />
      <Route path="/gallery/:id" component={GalleryDetail} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/about" component={About} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/login" component={AuthPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <BlogLayout>
            <Router />
          </BlogLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
