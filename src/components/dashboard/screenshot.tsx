"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { describeImage } from "@/ai/flows/describe-image-flow";
import { Card, CardContent } from "../ui/card";

export function Screenshot({ url, title }: { url: string; title: string }) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState<string>(title);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchScreenshot() {
      try {
        setLoading(true);
        const screenshotApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
          url
        )}&strategy=DESKTOP&screenshot=true`;
        const res = await fetch(screenshotApiUrl);
        if (!res.ok) {
          throw new Error("Failed to fetch screenshot");
        }
        const data = await res.json();
        const image_data =
          data?.lighthouseResult?.audits?.screenshot?.details?.data;
        if (image_data) {
          setScreenshotUrl(image_data);
        } else {
          throw new Error("No screenshot data in response");
        }
      } catch (error) {
        setScreenshotUrl(null);
      }
    }

    fetchScreenshot();
  }, [url]);

  useEffect(() => {
    async function fetchAltText() {
      if (!screenshotUrl) return;
      try {
        const description = await describeImage({
          photoDataUri: screenshotUrl,
        });
        setAltText(description.altText);
      } catch (error) {
        // Keep the title as fallback alt text
      } finally {
        setLoading(false);
      }
    }
    fetchAltText();
  }, [screenshotUrl]);

  if (loading) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!screenshotUrl) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Preview not available</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-md border bg-muted">
      <Image
        src={screenshotUrl}
        alt={altText}
        width={600}
        height={400}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}
