import { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxSeparator,
  ComboboxCollection,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxValue,
} from "./combobox.js";

const meta = {
  title: "Primitives/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const INGREDIENTS = [
  "Butter",
  "Carrot",
  "Crème fraîche",
  "Egg",
  "Flour",
  "Garlic",
  "Leek",
  "Onion",
  "Potato",
  "Thyme",
];

function Basic(props: { disabled?: boolean; showClear?: boolean; defaultValue?: string }) {
  return (
    <Combobox items={INGREDIENTS} defaultValue={props.defaultValue}>
      <ComboboxInput
        placeholder="Pick an ingredient"
        disabled={props.disabled}
        showClear={props.showClear}
      />
      <ComboboxContent>
        <ComboboxEmpty>No ingredient found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** Type to filter; arrows to move; Enter to pick. */
export const Default: Story = { args: {}, render: () => <Basic /> };

/** A value picked — the check marks it in the list. */
export const WithValue: Story = { args: {}, render: () => <Basic defaultValue="Leek" /> };

/** `showClear` adds an × that empties the field. */
export const Clearable: Story = {
  args: {},
  render: () => <Basic defaultValue="Thyme" showClear />,
};

export const Disabled: Story = { args: {}, render: () => <Basic disabled /> };

/** Type something that matches nothing to see ComboboxEmpty. */
export const Empty: Story = {
  args: {},
  render: () => (
    <Combobox items={[] as string[]} defaultOpen>
      <ComboboxInput placeholder="Nothing to find" />
      <ComboboxContent>
        <ComboboxEmpty>No ingredient found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => <ComboboxItem value={item}>{item}</ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

const GROUPS = [
  { value: "Vegetables", items: ["Carrot", "Leek", "Onion", "Potato"] },
  { value: "Dairy", items: ["Butter", "Crème fraîche", "Egg"] },
  { value: "Herbs", items: ["Garlic", "Thyme"] },
];

/** Grouped items, each with a label, separated. */
export const Grouped: Story = {
  args: {},
  render: () => (
    <Combobox items={GROUPS}>
      <ComboboxInput placeholder="Pick an ingredient" />
      <ComboboxContent>
        <ComboboxEmpty>No ingredient found.</ComboboxEmpty>
        <ComboboxList>
          {(group: (typeof GROUPS)[number], index: number) => (
            <ComboboxGroup key={group.value} items={group.items}>
              {index > 0 && <ComboboxSeparator />}
              <ComboboxLabel>{group.value}</ComboboxLabel>
              <ComboboxCollection>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};

function MultipleExample() {
  const anchor = useRef<HTMLDivElement>(null);
  return (
    <Combobox items={INGREDIENTS} multiple defaultValue={["Leek", "Butter"]}>
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map((value) => (
                <ComboboxChip key={value}>{value}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder={values.length ? "" : "Add ingredients"} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No ingredient found.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** `multiple` — picked values become removable chips; Backspace removes the last. */
export const Multiple: Story = { args: {}, render: () => <MultipleExample /> };

export const AllVariants: Story = {
  args: {},
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Basic />
      <Basic defaultValue="Leek" showClear />
      <Basic disabled />
      <MultipleExample />
    </div>
  ),
};
