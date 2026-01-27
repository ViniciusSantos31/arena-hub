import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export const MemberEmptyList = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:size-12 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            <Avatar>
              <AvatarImage
                src="https://github.com/gustavomenezesh.png"
                alt="@gustavomenezesh"
              />
              <AvatarFallback>GM</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/danhenriquex.png"
                alt="@danhenriquex"
              />
              <AvatarFallback>DH</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage
                src="https://github.com/viniciussantos31.png"
                alt="@viniciussantos31"
              />
              <AvatarFallback>VS</AvatarFallback>
            </Avatar>
          </div>
        </EmptyMedia>
        <EmptyTitle>Ainda não há membros</EmptyTitle>
        <EmptyDescription>
          Convide pessoas para participar do grupo.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
};
