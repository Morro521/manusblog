# MorroBlog - 沉浸式宇宙美学博客系统

一个融合二次元与极客文化的个人技术博客系统，采用沉浸式宇宙美学设计风格，支持在 fnos 系统上一键部署。

## ✨ 核心功能

### 用户与认证
- 邮箱验证码注册、密码登录、登出
- 163 SMTP 验证码邮件与频率限制
- 管理员与普通用户角色区分
- 权限管理系统

### 文章管理
- Markdown 编辑器支持
- 文章发布、草稿保存、删除
- 文章封面图上传（S3 存储）
- 阅读量统计与显示

### 内容组织
- 标签系统（创建、筛选）
- 分类系统（创建、筛选）
- 时间轴式文章归档
- 图片集展示功能

### 互动功能
- 评论系统（支持嵌套回复）
- 评论审核机制
- 实时互动反馈

### 视觉设计
  - 午夜天文台 × 日系独立技术刊物视觉语言
  - 墨黑纸感、冰蓝信号色、编辑型排版与非对称网格
  - 手动触发、来源可追溯的环境音
- 完全响应式布局

### 管理后台
- 文章管理模块
- 用户管理模块
- 评论审核模块

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | React 19 + Tailwind CSS 4 + TypeScript |
| **后端** | Express + tRPC + Node.js |
| **数据库** | MySQL 8.0 |
| **存储** | S3（文件存储） |
| **部署** | Docker + fnos |
| **认证** | 邮箱验证码 + 密码哈希 + JWT Cookie 会话 |

## 📦 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm check

# 运行测试
pnpm test
```

访问 `http://localhost:3000` 查看应用。

### Docker 部署（fnos）

#### 方式 1：使用 docker-compose

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，填入你的配置
# 然后启动服务
docker-compose up -d
```

#### 方式 2：在 fnos 中部署

1. 在 fnos 系统中打开 Docker 应用
2. 上传 `docker-compose.yml` 文件
3. 配置环境变量
4. 点击"启动"按钮

#### 环境变量配置

```env
# 数据库
MYSQL_ROOT_PASSWORD=your-password
MYSQL_DATABASE=morroblog
MYSQL_USER=morroblog
MYSQL_PASSWORD=your-db-password

# 应用
JWT_SECRET=your-jwt-secret
NODE_ENV=production

# 邮件验证码（163 SMTP 示例）
SMTP_HOST=smtp.163.com
SMTP_PORT=465
SMTP_USER=your-mail@163.com
SMTP_PASS=your-163-smtp-authorization-code
SMTP_FROM="MorroBlog <your-mail@163.com>"

# 首个管理员：填写与你用于注册的收件邮箱，不要填写 SMTP 发件邮箱
INITIAL_ADMIN_EMAIL=your-admin-registration-email@example.com
```

## 📁 项目结构

```
MorroBlog/
├── client/                 # 前端应用
│   ├── src/
│   │   ├── pages/         # 页面组件
│   │   ├── components/    # 可复用组件
│   │   ├── lib/           # 工具函数
│   │   └── App.tsx        # 主应用
│   └── index.html
├── server/                # 后端应用
│   ├── routers.ts         # tRPC 路由
│   ├── db.ts              # 数据库查询
│   └── _core/             # 核心框架
├── drizzle/               # 数据库 schema
├── docker-compose.yml     # Docker 编排
├── Dockerfile             # Docker 镜像
└── package.json
```

## 🗄️ 数据库架构

### 核心表

| 表名 | 说明 |
|------|------|
| `users` | 用户表 |
| `posts` | 文章表 |
| `comments` | 评论表（支持嵌套） |
| `tags` | 标签表 |
| `categories` | 分类表 |
| `post_tags` | 文章-标签关联 |
| `galleries` | 图片集表 |
| `images` | 图片表 |

## 🔌 API 路由

### 文章 API
- `GET /api/trpc/posts.list` - 获取文章列表
- `GET /api/trpc/posts.getBySlug` - 获取文章详情
- `POST /api/trpc/posts.create` - 创建文章
- `POST /api/trpc/posts.update` - 更新文章
- `POST /api/trpc/posts.delete` - 删除文章

### 评论 API
- `GET /api/trpc/comments.list` - 获取评论列表
- `POST /api/trpc/comments.create` - 创建评论
- `POST /api/trpc/comments.delete` - 删除评论

### 标签 API
- `GET /api/trpc/tags.list` - 获取标签列表
- `POST /api/trpc/tags.create` - 创建标签（管理员）

### 分类 API
- `GET /api/trpc/categories.list` - 获取分类列表
- `POST /api/trpc/categories.create` - 创建分类（管理员）

### 图片集 API
- `GET /api/trpc/galleries.list` - 获取图片集列表
- `GET /api/trpc/galleries.getById` - 获取图片集详情
- `POST /api/trpc/galleries.create` - 创建图片集（管理员）
- `POST /api/trpc/galleries.addImage` - 添加图片（管理员）

## 🎨 设计特色

### 宇宙美学主题
- 午夜蓝与紫罗兰渐变背景
- 散落星光与柔和星云光晕
- 发光青色外描边标题
- 行星球体与镜头光晕效果

### 交互与可访问性
- 简洁的平滑过渡与键盘可达导航
- 桌面与移动端独立的信息密度和编辑操作布局
- 环境音仅在访客主动点击后播放

## 🔐 安全性

- 邮箱验证码注册，验证码哈希存储、10 分钟有效、60 秒发送冷却和每小时频率限制
- bcrypt 密码哈希与 httpOnly JWT Cookie 会话
- 评论审核机制
- 管理员权限控制
- SQL 注入防护（Drizzle ORM）

## 📝 开发指南

### 添加新页面

1. 在 `client/src/pages/` 创建页面组件
2. 在 `client/src/App.tsx` 中添加路由
3. 在 `BlogLayout` 中更新导航（如需要）

### 添加新 API

1. 在 `server/db.ts` 添加数据库查询函数
2. 在 `server/routers.ts` 添加 tRPC 过程
3. 在前端使用 `trpc.*.useQuery/useMutation` 调用

### 数据库迁移

```bash
# 修改 schema
# 编辑 drizzle/schema.ts

# 生成迁移文件
pnpm drizzle-kit generate

# 执行迁移
pnpm drizzle-kit migrate
```

## 🚀 部署到 fnos

### 前置条件
- fnos 系统已安装
- Docker 支持已启用
- MySQL 容器可用

### 部署步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/MorroBlog.git
   cd MorroBlog
   ```

2. **配置环境**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件
   ```

3. **启动服务**
   ```bash
   docker-compose up -d
   ```

4. **访问应用**
   - 打开浏览器访问 `http://your-fnos-ip:3000`
   - 使用邮箱注册：获取验证码、验证邮箱并设置密码

## 📊 监控与维护

### 查看日志
```bash
docker-compose logs -f app
docker-compose logs -f mysql
```

### 备份数据库
```bash
docker-compose exec mysql mysqldump -u morroblog -p morroblog > backup.sql
```

### 更新应用
```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

## 🐛 故障排除

| 问题 | 解决方案 |
|------|--------|
| 数据库连接失败 | 检查 `DATABASE_URL` 环境变量 |
| 收不到验证码 | 检查 `SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS` 与垃圾邮件箱 |
| 文件上传失败 | 检查 S3 存储配置 |
| 页面加载缓慢 | 检查网络连接和数据库性能 |

## 📄 许可证

MIT License

## 👤 作者

Morro - 沉浸式宇宙美学博客爱好者

## 🙏 致谢

感谢所有开源项目的贡献者，特别是：
- React & Tailwind CSS 团队
- tRPC 和 Drizzle ORM 开发者
- Manus 平台支持

---

**最后更新**: 2024年7月15日  
**版本**: v1.0.0  
**状态**: 🚀 生产就绪
