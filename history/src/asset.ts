// 把以 / 开头的 public 资源路径加上部署前缀（独立运行时为 /，嵌在开门页后面时为 /history/）
export const asset = (p: string) => (p && p.startsWith('/') ? import.meta.env.BASE_URL + p.slice(1) : p);
/** 是否作为「开门页」后面的第二站运行 */
export const underGate = import.meta.env.BASE_URL !== '/';
