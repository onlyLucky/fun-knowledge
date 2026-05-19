/**
 * 获取弹窗 Portal 目标容器 (#app-container)
 * 所有弹窗应渲染到此容器内，而非 document.body
 */
export function getPortalTarget(): HTMLElement {
  return document.getElementById('app-container') || document.body;
}
