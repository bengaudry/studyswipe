import imageCompression from "browser-image-compression";
import { useSession } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import {
  Dispatch,
  SetStateAction,
  PropsWithChildren,
  useState,
  useContext,
  createContext,
} from "react";

const supabase = createClient(
  "https://oqtjixzwhpbmzpsieuoo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdGppeHp3aHBibXpwc2lldW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNDk5MDksImV4cCI6MjA1MjcyNTkwOX0.hSbFpfD-y_0okPX61KsdSPE2KogyO5LtzDqVn9T3D40"
);

export const SupabaseImageUploadContext = createContext<{
  queue: File[];
  setQueue: Dispatch<SetStateAction<File[]>>;
}>({ queue: [], setQueue: () => {} });

export const SupabaseImageUploadProvider = ({
  children,
}: PropsWithChildren) => {
  const [queue, setQueue] = useState<File[]>([]);
  return (
    <SupabaseImageUploadContext.Provider value={{ queue, setQueue }}>
      {children}
    </SupabaseImageUploadContext.Provider>
  );
};

export function useSupabaseImageUpload() {
  const { queue, setQueue } = useContext(SupabaseImageUploadContext);
  const [isPushing, setIsPushing] = useState(false);

  const { data: session } = useSession();

  const addFileToQueue = (file: File) => {
    console.info("Adding", file.name, "to queue");
    setQueue((prev) => {
      console.log(prev);
      return [...prev, file];
    });

    const image = new Image();
    image.src = URL.createObjectURL(file);
    const imgDbUri = `https://oqtjixzwhpbmzpsieuoo.supabase.co/storage/v1/object/public/deck-images/${session?.user?.id}/${file.name}`;

    return { imgDbUri, image };
  };

  const pushImages = async () => {
    setIsPushing(true);
    console.info("Pushing", queue.length, "images");
    console.log(queue);
    try {
      queue.forEach(async (file) => {
        if (file === null) throw { error: "NullFile" };
        if (!session?.user?.id) throw { error: "Unauthenticated" };

        const compressedImage = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });

        const { error } = await supabase.storage
          .from("deck-images")
          .upload(`${session.user.id}/${file.name}`, compressedImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;
        emptyQueue();
      });
    } catch (err) {
      throw err;
    } finally {
      setIsPushing(false);
    }
  };

  const emptyQueue = () => setQueue([]);

  return {
    addFileToQueue,
    updateQueue: setQueue,
    pushImages,
    emptyQueue,
    isPushing,
  };
}
