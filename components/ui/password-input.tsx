"use client";

import * as React from "react";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput(
  props: React.ComponentProps<typeof Input> & { className?: string }
) {
  const { className, ...rest } = props;
  const [show, setShow] = React.useState(false);

  return (
    <div className="relative">
      <Input
        {...rest}
        type={show ? "text" : "password"}
        className={`${className ?? ""} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-transparent text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

export default PasswordInput;
