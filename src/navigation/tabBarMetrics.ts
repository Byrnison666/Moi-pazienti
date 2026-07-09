export const TAB_BAR_BASE_HEIGHT = 66;
export const TAB_BAR_BOTTOM_MARGIN = 14;
export const TAB_BAR_SIDE_MARGIN = 16;
export const TAB_BAR_FAB_OFFSET = 16;
export const TAB_BAR_LIST_PADDING = 48;
export const TAB_BAR_DETAIL_PADDING = 32;
// Список под плавающей кнопкой: она начинается на TAB_BAR_FAB_OFFSET выше бара
// и сама высотой ~46 (AppButton size=md: padV 12*2 + строка ~20).
// Запас 82: на устройстве бар накрывал последнюю карточку примерно на 41dp
// (замер по скриншоту), остальное — чтобы карточка не липла к бару.
export const TAB_BAR_FAB_LIST_PADDING = TAB_BAR_FAB_OFFSET + 46 + 82;

export function getTabBarHeight(bottomInset: number) {
  return TAB_BAR_BASE_HEIGHT + TAB_BAR_BOTTOM_MARGIN + bottomInset;
}

export function getFloatingActionBottom(bottomInset: number) {
  return getTabBarHeight(bottomInset) + TAB_BAR_FAB_OFFSET;
}

export function getListBottomPadding(bottomInset: number) {
  return getTabBarHeight(bottomInset) + TAB_BAR_LIST_PADDING;
}

// Для экранов, где над баром висит плавающая кнопка: иначе она накрывает
// последний элемент списка.
export function getFabListBottomPadding(bottomInset: number) {
  return getTabBarHeight(bottomInset) + TAB_BAR_FAB_LIST_PADDING;
}

export function getDetailBottomPadding(bottomInset: number) {
  return getTabBarHeight(bottomInset) + TAB_BAR_DETAIL_PADDING;
}
