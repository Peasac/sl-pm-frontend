import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { Contact } from "@/lib/types";

export function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Card className="bg-card/80 reveal-up">
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar>
          <AvatarFallback>{contact.avatar}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold text-foreground">{contact.name}</p>
          <p className="text-xs text-muted-foreground">{contact.role}</p>
          <p className="text-xs text-muted-foreground">{contact.email}</p>
        </div>
      </CardContent>
    </Card>
  );
}
