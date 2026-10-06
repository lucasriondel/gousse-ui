/**
 * gousse-ui barrel — re-exports every primitive plus `cn`.
 * Primitives are added here as each migration commit lands.
 */
export { cn } from "./utils.js";
export { Spinner } from "./spinner.js";
export { Separator } from "./separator.js";
export { Badge, badgeClasses, type BadgeVariant } from "./badge.js";
export { Avatar } from "./avatar.js";
export { Empty } from "./empty.js";
export { RainbowGlow } from "./rainbow-glow.js";
export { Sheen } from "./sheen.js";
export { Button } from "./button.js";
export { Input } from "./input.js";
export { Textarea } from "./textarea.js";
export { Select } from "./select.js";
export { Checkbox } from "./checkbox.js";
export { RadioGroup, RadioGroupItem } from "./radio-group.js";
export { Switch } from "./switch.js";
export { ThemeSwitcher, type ThemePreference } from "./theme-switcher.js";
export { Tabs, TabsList, TabsTab, TabsIndicator, TabsPanel } from "./tabs.js";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu.js";
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogCloseButton,
} from "./dialog.js";
export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
  SheetClose,
  SheetCloseButton,
  type SheetSide,
} from "./sheet.js";
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverClose,
} from "./popover.js";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./tooltip.js";
export {
  Combobox,
  ComboboxValue,
  ComboboxCollection,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
  ComboboxEmpty,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
} from "./combobox.js";
export {
  Toaster,
  toast,
  createToastManager,
  useToastManager,
  ToastProvider,
  ToastPortal,
  ToastViewport,
  Toast,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  ToastIcon,
} from "./toast.js";
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "./card.js";
export { Skeleton } from "./skeleton.js";
export { Notice, NoticeList, NoticeListItem, type NoticeVariant } from "./notice.js";
export { Steps, type Step } from "./steps.js";
export { ProviderMark, KNOWN_PROVIDER_MARKS } from "./provider-mark.js";
export { SettingsCard, SettingRow } from "./setting-row.js";
export { SavedFlash } from "./saved-flash.js";
export { SecretField } from "./secret-field.js";
export { CredentialTile, CredentialGrid, CredentialStatusPill } from "./credential-tile.js";
export { ModelRow, type ModelOption, type ProviderOption } from "./model-row.js";
export {
  AppShell,
  AppMain,
  AppContent,
  TopBar,
  TopBarStart,
  TopBarTitle,
  TopBarEnd,
  useAppShell,
} from "./app-shell.js";
export {
  Sidebar,
  SidebarShell,
  SidebarHeader,
  SidebarTitle,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarItem,
  SidebarGlyph,
  SidebarFooter,
  SidebarTrigger,
  SidebarClose,
  SidebarCollapsible,
  sidebarRowClass,
  type SidebarItemRenderProps,
  type SidebarTitleRenderProps,
} from "./sidebar.js";

/* Ai Ui — the agent components: status, output, and interaction blocks. */
export { ThinkingState, formatElapsed, useElapsed, type ThinkingStatus } from "./thinking-state.js";
export { Reasoning, ReasoningStep } from "./reasoning.js";
export { Orb, ORB_VARIANTS, type OrbVariant } from "./orb.js";
export { AudioWaves, type AudioWavesVariant } from "./audio-waves.js";
export {
  FileDiff,
  parseUnifiedDiff,
  type DiffRow,
  type DiffRowType,
  type DiffReviewStatus,
} from "./file-diff.js";
export {
  ImageGeneration,
  type ImageGenerationStatus,
  type ImageAspect,
} from "./image-generation.js";
export { TextResponse, ResponseAction } from "./text-response.js";
export { StreamingText, useSimulatedStream } from "./streaming-text.js";
export { CopyButton } from "./copy-button.js";
export { CodeBlock } from "./code-block.js";
export { Citation, CitedText, SourceList, type Source } from "./inline-citations.js";
export { TaskList, TaskItem, type Task, type TaskStatus } from "./task-list.js";
export { DataTable, type DataTableColumn } from "./data-table.js";
export {
  ComparisonTable,
  type ComparisonOption,
  type ComparisonFeature,
} from "./comparison-table.js";
export { ReasoningEffort, DEFAULT_EFFORT_LEVELS } from "./reasoning-effort.js";
export { AgentInput, type AgentModel, type AgentAttachment } from "./agent-input.js";
export {
  ApprovalCard,
  ApprovalCommand,
  ApprovalPlan,
  QuestionCard,
  type ApprovalStatus,
  type ClarifyQuestion,
} from "./approval-card.js";
