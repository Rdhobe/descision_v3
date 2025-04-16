import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// Dynamically import the emoji picker to reduce bundle size
const Picker = dynamic(() => import('emoji-picker-react'), { 
  ssr: false,
  loading: () => <div className="flex justify-center p-4">Loading...</div>
});

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker = ({ onEmojiSelect }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        className="w-full mb-2 p-0" 
        sideOffset={5}
      >
        <Picker 
          onEmojiClick={(emojiData) => {
            onEmojiSelect(emojiData.emoji);
            setOpen(false);
          }}
          lazyLoadEmojis={true}
          skinTonesDisabled
          searchDisabled={false}
          width="100%"
          height="350px"
          previewConfig={{
            showPreview: false
          }}
        />
      </PopoverContent>
    </Popover>
  );
}; 