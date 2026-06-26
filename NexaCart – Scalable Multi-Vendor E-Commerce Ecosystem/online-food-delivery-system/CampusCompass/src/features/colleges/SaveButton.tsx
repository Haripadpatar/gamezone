"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SaveButtonProps {
  collegeId: string;
  initialIsSaved: boolean;
  collegeName: string;
}

export default function SaveButton({ collegeId, initialIsSaved, collegeName }: SaveButtonProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [saved, setSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!session) {
      toast("Please sign in to save colleges", "info");
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        const res = await fetch(`/api/saved?collegeId=${collegeId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setSaved(false);
          toast(`${collegeName} removed from bookmarks`, "success");
        } else {
          toast("Failed to unsave college", "error");
        }
      } else {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collegeId }),
        });
        if (res.ok) {
          setSaved(true);
          toast(`${collegeName} saved successfully!`, "success");
        } else {
          toast("Failed to save college", "error");
        }
      }
    } catch (err) {
      console.error(err);
      toast("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      isLoading={loading}
      variant={saved ? "primary" : "outline"}
      className="gap-2 cursor-pointer"
    >
      <Bookmark className={`h-4.5 w-4.5 ${saved ? "fill-white text-white" : "text-slate-400"}`} />
      <span>{saved ? "Saved" : "Save College"}</span>
    </Button>
  );
}
