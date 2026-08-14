/** 地层信号设计基线：入口只挂载静态 React 应用，不初始化认证、数据库或远程请求客户端。 */
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
