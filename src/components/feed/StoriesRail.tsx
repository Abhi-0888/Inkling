import { Plus } from 'lucide-react';

const STORIES = [
  { id: '1', name: 'Add Story', isUser: true },
  { id: '2', name: 'Campus News', image: 'from-blue-400 to-indigo-500' },
  { id: '3', name: 'Events', image: 'from-purple-400 to-pink-500' },
  { id: '4', name: 'Confessions', image: 'from-orange-400 to-red-500' },
  { id: '5', name: 'Sports', image: 'from-green-400 to-emerald-500' },
  { id: '6', name: 'Music', image: 'from-yellow-400 to-orange-500' },
];

export const StoriesRail = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-4 pt-2 no-scrollbar">
      {STORIES.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1 min-w-[64px] cursor-pointer group">
          <div className={`w-16 h-16 rounded-full p-[3px] ${story.isUser ? 'border-2 border-dashed border-muted-foreground/30' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600'}`}>
            <div className={`w-full h-full rounded-full border-2 border-background flex items-center justify-center ${story.isUser ? 'bg-secondary' : `bg-gradient-to-br ${story.image}`}`}>
              {story.isUser ? (
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <div className="w-full h-full rounded-full opacity-0 group-hover:opacity-20 bg-black transition-opacity" />
              )}
            </div>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground truncate w-full text-center">
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
};
