import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function MentorCard({ mentor, onAsk }) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground p-4 shadow-sm hover:shadow-md transition">
      {/* 상단: 이름 + 태그 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{mentor.name}</h2>
        <span
          className={`rounded px-2 py-1 text-xs text-white ${mentor.color}`}
        >
          {mentor.tag}
        </span>
      </div>

      {/* 중간: 아바타 + 정보 */}
      <div className="mb-2 flex items-center gap-2">
        <Avatar className="h-8 w-8 ring-1 ring-border">
          <AvatarImage
            src={`https://i.pravatar.cc/80?img=${mentor.id * 5}`}
            alt="user"
          />
          <AvatarFallback>
            {mentor.name.slice(0, 2)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col leading-tight">
          <p className="text-sm text-muted-foreground">{mentor.role}</p>
          <p className="text-xs text-muted-foreground">{mentor.company}</p>
        </div>
      </div>

      {/* 하단: 버튼 */}
      <Button
        className="mt-3 w-full"
        onClick={() => onAsk(mentor)}
      >
        상담하기
      </Button>
    </div>
  )
}
