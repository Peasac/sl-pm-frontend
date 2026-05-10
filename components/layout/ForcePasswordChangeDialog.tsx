"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import PasswordInput from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/components/providers/AppProvider";

export function ForcePasswordChangeDialog() {
  const { user, updateAuthAccountPassword } = useAppContext();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const isOpen = Boolean(user?.requiresPasswordChange);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password.length > 18) {
      setError("Password must not exceed 18 characters");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await updateAuthAccountPassword(user!.email, password);
      // We must reload the page so the user context fetches again and requiresPasswordChange becomes false
      window.location.reload();
    } catch (e) {
      setError("Failed to change password. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" hideCloseButton>
        <DialogHeader>
          <DialogTitle>Update Your Password</DialogTitle>
          <DialogDescription>
            For security reasons, you must change your password before continuing to use the portal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <div className="text-sm font-medium text-destructive">{error}</div>}
          <div className="grid gap-2">
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">{password.length}/18 characters</div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">{confirmPassword.length}/18 characters</div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting || !password || !confirmPassword}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
