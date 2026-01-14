import Image from "next/image";

export const AvatarStack = () => {
  return (
    <div className="flex -space-x-2">
      <Image
        data-slot="avatar-image"
        width={128}
        height={128}
        className="ring-card inline-block h-8 w-8 rounded-full object-cover ring-4"
        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        alt="Avatar 1"
      />
      <Image
        data-slot="avatar-image"
        width={128}
        height={128}
        className="ring-card inline-block h-8 w-8 rounded-full object-cover ring-4"
        src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        alt="Avatar 2"
      />
      <Image
        data-slot="avatar-image"
        width={128}
        height={128}
        className="ring-card inline-block h-8 w-8 rounded-full object-cover ring-4"
        src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGVvcGxlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60"
        alt="Avatar 3"
      />
      <div
        data-slot="avatar-image"
        className="ring-card bg-muted flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ring-4"
      >
        +3
      </div>
    </div>
  );
};
