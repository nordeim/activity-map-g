我将按照指令继续执行这个任务。让我先创建一个任务清单，然后开始克隆仓库并逐步推进。
## 步骤 1：克隆仓库并精读核心文档
仓库已克隆。现在精读五份核心文档：
核心文档已读完。现在读取 session 文档和 worklog：

## 步骤 2：精读 session_52、session_53、remediation-plan-session-51、worklog、start_server_log
文档已读完。当前状态清晰：HEAD `61da59a` = v2.21 树 + 操作员重部署日志（镜像已从 v2.21 树重启）。现在对照代码库验证理解：

## 步骤 3：对照代码库验证理解
v2.21 代码已确认在位。现在搭建环境并跑基线 gate：
数据库种子完成（118784 字节 = 文档精确值）。运行基线 gate：
lint ✓ (0 errors) · typecheck ✓ · **92/92 unit** ✓ · build ✓。继续 smoke + E2E：
**基线 gate 全绿**：lint 0 错误 · typecheck ✓ · **92/92 unit** · build ✓ · **31/31 smoke** · **92/92 E2E** — 与 session_52 文档记录完全一致。

## 步骤 4：审计近期 git 变更（a358ffb → 61da59a，v2.19–v2.21 范围）
代码与文档完全一致。现在查看 skills 目录，准备代码审查工具：

## 使用仓库 skills/ 辅助审查
Skills 目录已确认。现在开始浏览器双站审计 — 先加载 agent-browser 技能：

## 步骤 5：浏览器 E2E 双站审计（镜像 vs 源站）
agent-browser 0.38.1 可用。开始双站审计 — 先验证镜像部署状态：
镜像已运行 v2.21（标题 "Activity Map" 确认）。现在进行 390px 移动端导航审计（任务重点）：
移动端导航几何**精确匹配**（121/192/222/259 + 图标 304/330/356 + 52px glass bar）。现在测试功能导航点击：
镜像确认运行 v2.21。现在清扫控制台错误 + 验证 demo 登录路径：
零控制台错误。现在验证 demo 登录路径（v2.21 契约）：
桌面导航**精确匹配**（433/559/639/727/805 + heart 957 + "S" 1001）。验证 demo profile 身份和 /login-stay 行为：
镜像 v2.21 全部契约确认。现在登录**源站**做 parity 对比：
已登录源站。重新测量源站关键 parity 表面（首先检查波动性身份表面）：
源站桌面导航与镜像**完全一致**（含 "S" avatar 初始）。现在测量波动性 profile 身份表面：
源站认证身份保持不变（第五次测量仍为 "sepnetflix2023" + 邮箱副标题）。现在检查源站匿名状态（v2.21 契约）：
源站匿名状态与 v2.21 契约完全一致（user-icon avatar 17px stroke 2）。现在测量源站 390px 移动端导航（任务重点）：
源站移动端导航与镜像**完全一致**（121/192/222/259 + 304/330/356 + 52px glass）— **无 Tailwind v4 回归**。继续扫其余 parity 表面：
Eat chips 和标题 parity **精确一致**。继续 place detail 和 footer 对比：
两个站点对未知 slug 的行为一致（404 parity ✓）。用真实 slug 对比：
发现潜在差异：源站 detail 标题为 "Eat | Activity Map"（非 "Place Page"）。验证直接加载 vs 客户端导航的差异：
直接加载时源站 detail 标题**确认为 "Place Page | Activity Map"** ✓ — 之前的差异是 SPA 客户端导航的标题残留怪癖（非克隆差距）。继续 footer 和 detail 几何对比：
Detail 几何 **完全一致**（82px h1 @y=225 · 1150×460 照片 · 7 字段表单）。对比 footer grown pill：
Footer 探针选中了错误元素。精确定位 glass pill（带 backdrop-filter 的元素）：
镜像 footer 探测到了异常的 class 组合。验证 viewport 状态并重新探测：
镜像 footer pill 的 class 是 mobile-first + md: 覆盖（正常）。重新探测 `--footer-p` 值和最终几何：
Footer **完全一致**（646×118 · r34 · gap 12，之前是过渡中的中间测量）。继续首页 h1 和登录卡对比：
登录卡**完全一致**。进行移动端 390 全面清扫（map/stay/do + 源站控制台错误检查）：
Map 统计 pills 两站一致。检查 stay/do chips 和匿名 favourites 行为：
Chips **完全一致**。验证源站匿名 favourites 行为（F4 记录的分歧）：
源站匿名状态确认只读（F4 记录的分歧保持不变）。现在功能测试镜像的 favourites 往返和 booking 流程：
Favourites 往返**正常工作**。取消保存恢复状态，然后测试 booking 流程：
Booking 往返**正常**（Upcoming (1) + 15 Oct 19:00 — 日历天分类生效）。对比源站的 booking 确认行为：
发现潜在结构差异：源站 Dates/Time 是 **button**（弹出选择器），镜像是 **textbox**。深入探查源站行为：
**发现真实 parity 差距**：源站 booking 表单的 Dates/Time 是日历/时间弹出选择器，镜像是纯文本输入。检查源站 Time 按钮和镜像实现：
**确认差距 F1**：源站日期/时间字段是 44px **选择器触发按钮**（"Choose dates"/"Choose time" + 隐藏 input）。查看源站时间选择器：
源站时间选择器 = 30 分钟间隔列表（08:00–22:00）。测量两个弹出层的完整 chrome：
时间选择器细节已捕获（29 个 40px 按钮）。现在测量日历弹出层结构：
日历结构已捕获（月 select + 42 天网格）。测量触发按钮 chrome 和选中态：
Dates 字段块结构完全捕获。点击日期查看选中态和 value 显示：
**关键发现**：源站 booking 日期选择器是**范围选择器**（"Thu 15 Oct — select end date"）。完成范围选择：
范围选择完成：**"Thu 15 Oct — Sat 17 Oct"** + 隐藏值 "2026-10-15 to 2026-10-17"。检查时间选择值 + 查看镜像当前实现：
**差距确认**：镜像是自由文本输入，源站是选择器按钮。提交源站 booking 看确认消息：
源站提交后显示内联成功消息（表单重置）。测量成功消息样式 + 对比镜像的提交反馈：
镜像的 F1 差距已完全明确（自由文本 vs 选择器 + 成功消息样式/文案 + 表单重置）。测量源站移动端弹出层几何和日历完整结构：
弹出层定位机制已明确（`bottom-[calc(100%+8px)]` 向上弹出）。验证日历无 header/footer 和移动端时间弹出层：
日期单元格状态模型完整捕获（violet 端点 + #F0E9FF 中间 + hover 黑色）。捕获时间列表按钮完整 class：
Chevron 打开时旋转 180° 确认。获取弹出层完整 class（含 md: 变体）：
弹出层位置契约捕获（移动端向上/md+ 向下）。测试源站的错误反馈样式：
原生验证阻止了无效提交（与镜像一致，非差距）。审计完成。检查镜像现有 E2E booking 测试的 pins：
检查文档命名约定，确定本次 session 编号：
命名约定确认（本次 = session 54，计划 = remediation-plan-session-53）。最后检查日历的跨月日期样式：
审计完成 — F1 完整契约已捕获。关闭浏览器会话并撰写整改计划：

## 步骤 6：撰写综合整改计划（remediation-plan-session-53）
## 计划验证：对照代码库检查所有触点
API 契约验证完成（ISO 日期 + endDate≥startDate 校验）。测试源站的空日期提交验证行为：
源站隐藏输入框契约捕获（`pointer-events-none absolute bottom-0 left-0 h-px w-px opacity-0` + required）。开始 TDD 执行：

## 步骤 7：R0 — RED（先写失败测试）
单元测试 RED 确认（模块不存在）。现在翻转 E2E pins（R0 第 2 部分）：
现在让我更新 `booking-form` E2E 测试，并使用选择器契约添加新的测试：
现在更新 booking 往返测试为选择器交互：
现在添加新的 picker 契约 E2E 测试块：
加强往返测试的成功消息 chrome 和表单重置 pins：
R0 完成。验证 RED 状态（现有构建 + 新测试）：
**RED 确认** — 3 个 booking 测试全部失败（选择器不存在）。开始 R1 GREEN：

## 步骤 8：R1 — 纯 seam `src/lib/booking-picker.ts`
修复测试正则（测试 bug，非 seam bug）：
R1 GREEN（21/21）。快速验证源站时间按钮选中态内部结构（justify-between 含义）：
已确认选中状态（Check 图标 15px + violet）。关闭浏览器，重写 E2E 为**日期稳健**版本（防时间炸弹）：
修复往返测试的日期定位（用 data-date 属性避免歧义）：
现在创建 R2 选择器组件：
## R3 — BookingForm 接线
运行 typecheck 和 lint 验证：
**113/113 unit** 全绿（92 + 21 新增）。重建并运行 E2E 验证 GREEN：
**E2E GREEN** — 3 个 booking 测试全部通过。运行完整 gate 确认无回归：
单跑通过 — 是首页图片晚加载的已知 flake（文档记录的 flake 类）。重跑完整 E2E 确认：
**93/93 E2E 全绿**。开始 R4 — dev-server DOM 验证：
日历结构与源站测量值**完全一致**。测试范围选择 + 时间选择 + booking 往返：
时间选择器验证通过。完成 booking 往返测试（含成功消息 + 重置）：
成功消息和重置**全部验证通过**。验证 booking 落入 profile 的 Upcoming：
Booking 往返完整验证（15 Oct – 17 Oct 范围 + Upcoming）。检查移动端弹出层方向：
移动端向上弹出**验证通过**（308px 宽，与源站一致）。R4 完成。开始 R5 — 截图捕获：
创建 session54 截图脚本（17 张复拍 + 2 张新选择器捕获）：
19 张截图全部捕获。验证新 picker 截图有效性：
用 VLM 验证两张新截图内容：
18 截图完美（日历+中间态）。19 截图有问题 — 时间列表在桌面端向下打开超出视口被截断。修复捕获脚本（元素级截图 + 日期稳健）：
两张新截图均验证通过。现在进行文档对齐 — 先修 AGENTS.md（含过时的计数 87/84 → 113/93）：
AGENTS.md 完成。更新 CLAUDE.md：
CLAUDE.md 完成。更新 README.md：
README 完成。更新 PAD v2.22（revision block + 各节）：
清理 PAD 中的重复行（之前 MultiEdit 部分应用导致）：
PAD 完成。更新 activity-map_SKILL.md（版本 1.22.8 + v2.22 状态）：
SKILL 完成。更新 findings 文档 + 撰写 session_54.md：
现在开始编写 session log：
## R6 — 最终全 Gate ×2
**全 gate ×2 全绿**（113/113 unit · 31/31 smoke · 93/93 E2E）。准备 commit + push：
截图变更模式奇怪（08-place-detail 未变？）。验证截图内容差异：
08 截图是视口截图（表单在折叠线下方）— 符合预期，18/19 新截图专门记录选择器。验证 .env.example 状态：
`.env.example` 已跟踪且与代码库一致。最终安全扫描后 commit：
已提交 `22d2ba4`。现在读取 SSH wrapper 用法并推送：
将 SSH 密钥物化到仓库外，先 dry-run 再实际推送：
无 OpenSSH 二进制（与 runbook 记录的场景一致）。查看 wrapper 的 ssh-binary 预检和 paramiko shim：
paramiko 5.0.0 可用。创建 shim（仓库外）并执行 dry-run：
Dry-run 成功（fast-forward `61da59a..22d2ba4`）。执行实际推送：
**推送成功并验证**：remote main @ `22d2ba4` == local HEAD，工作树干净，操作员密钥已销毁。最终远程验证：
远程 main 确认 `22d2ba4` — 推送完成。更新最终任务状态：
## 任务完成总结

**Session 54（v2.22）已推送到 main — commit `22d2ba4`**

### 审计结果
- **移动端导航菜单（任务重点）**：两站 390px 几何与功能**完全一致**（121/192/222/259 + 52px glass bar，四图标点击全部正常）— **无 Tailwind v4 回归**
- **身份表面**：第五次测量稳定（"sepnetflix2023" + 匿名 "Explorer"），标题/页脚/chips/detail/login 全部 EXACT，两站零控制台错误
- **发现唯一差距（F1）**：源站 booking 表单的 Dates/Time 是**弹出式选择器**（日历范围选择 + 29 槽时间列表），镜像是自由文本输入

### TDD 整改
- 新增 `booking-picker.ts` 纯 seam（21 单测）+ `BookingDatePicker`/`BookingTimePicker` 组件 + 表单接线（真实日期范围 POST + 源站成功消息 + 表单重置）
- Gate ×2 全绿：**113 unit · 31 smoke · 93 E2E**；19 张截图（含 2 张新选择器捕获）；10+ 文档对齐

**建议下一步**：从 `22d2ba4` 重新部署镜像并重新播种数据库，然后对线上环境重跑 smoke 验证。
