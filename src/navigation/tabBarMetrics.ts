export const TAB_BAR_BASE_HEIGHT = 64;
export const TAB_BAR_FAB_OFFSET = 16;
export const TAB_BAR_LIST_PADDING = 48;
export const TAB_BAR_DETAIL_PADDING = 32;

export function getTabBarHeight(bottomInset: number) {
  return TAB_BAR_BASE_HEIGHT + bottomInset;
}

export function getFloatingActionBottom(bottomInset: number) {
  return getTabBarHeight(bottomInset) + TAB_BAR_FAB_OFFSET;
}

export function getListBottomPadding(bottomInset: number) {
  return getTabBarHeight(bottomInset) + TAB_BAR_LIST_PADDING;
}

export function getDetailBottomPadding(bottomInset: number) {
  return getTabBarHeight(bottomInset) + TAB_BAR_DETAIL_PADDING;
}
