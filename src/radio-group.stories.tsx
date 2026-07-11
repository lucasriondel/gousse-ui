import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const ACCOUNTS = ["lucas@example.com", "work@example.com", "hey@example.com"];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(ACCOUNTS[0]);
    return (
      <RadioGroup className="w-72">
        {ACCOUNTS.map((email) => (
          <RadioGroupItem
            key={email}
            name="account"
            value={email}
            checked={value === email}
            onSelect={() => setValue(email)}
          >
            {email}
          </RadioGroupItem>
        ))}
      </RadioGroup>
    );
  },
};
