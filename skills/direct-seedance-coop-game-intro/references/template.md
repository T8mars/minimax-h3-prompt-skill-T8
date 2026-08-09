# Seedance co-op game intro template

## Lock sheet

```text
玩家A@图片1: [identity anchors], left/right position, accent color, outfit
玩家B@图片2: [identity anchors], opposite position, accent color, outfit
图片3: [optional approved menu layout/style only]
Title/player/UI text: [exact approved strings]
Palette: [main, UI body, text, functional accent, danger accent]
```

## Prompt skeleton

```text
镜头1：16:9 游戏主菜单构图，玩家A@图片1与玩家B@图片2保持各自身份、服装、位置和色彩绑定。界面层级清晰，出现已确认标题【...】与玩家名【...】【...】。角色做轻微待机动作，镜头稳定。
镜头2：焦点框沿菜单移动到已确认按钮【...】，按钮产生克制的按压、亮边和确认反馈；两位角色的目光与姿态同步响应，<清晰菜单确认音>。
镜头3：界面进入已确认的合作就绪状态，玩家卡和主按钮保持可读，角色完成互补的庆祝动作，构图稳定收束。
约束：两位玩家不可互换、复制或融合；所有菜单文字只使用已确认内容；不新增 Logo、按钮、数值或商业游戏元素；UI 不遮挡脸部。
```

Adapt shot count to the actual event chain. Avoid camera movement when it harms UI readability.

## Audit

- Character labels, screen sides, wardrobe, and palette accents never swap.
- Every visible string is approved and wrapped once in `【...】`.
- UI state changes are causally visible.
- No exact shot timestamps or H3 grammar remains.
