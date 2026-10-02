import clsx from "clsx";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { pricingCards } from "@/constants/landing-page";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { onGetBlogPosts } from "@/actions/landing";
import parse from "html-react-parser";
import { getMonthName } from "@/lib/utils";

// Blog posts come from WordPress at request time; keep this page dynamic.
export const dynamic = "force-dynamic";

export default async function Home() {
  // WIP: Challenge to setup billing card
  const posts:
    | {
        id: string;
        title: string;
        image: string;
        content: string;
        createdAt: Date;
      }[]
    | undefined = await onGetBlogPosts();

  return (
    <main>
      <Navbar />
      <section>
        <div className="flex items-center justify-center flex-col mt-[80px] gap-4">
          <span className="text-orange bg-orange/20 px-4 py-2 rounded-full text-sm">
            An AI powered taxes assistant chatbot
          </span>
          {/* <Image
            src="/images/corinna-ai-logo.png"
            width={500}
            height={100}
            alt="Corinna AI Logo"
            className="max-w-lg object-contain"
          /> */}
          <p className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange to-grandis/50">
            BrAInance
          </p>
          <p className="text-center max-w-[500px]">
            Your AI powered taxes assistant! Embed BrAInance into your life to manage your taxes!
          </p>
          <Link
            href="/dashboard"
            className="bg-orange px-4 py-2 rounded-sm text-white font-bold hover:bg-primary/90"
          >
            Start For Free
          </Link>
          <Image
            src="/images/iphoneApp.svg"
            width={400}
            height={100}
            alt="Corinna on iPhone"
            className="max-w-lg object-contain"
          />
        </div>
      </section>
      <section className="flex justify-center items-center flex-col gap-4 mt-10">
        <h2 className="text-4xl text-center">Choose what fits you right</h2>
        <p className="text-muted-foreground text-center max-w-lg">
          Our straightforward pricing plans are tailored to meet your needs. If
          {" you're"} not ready to commit you can get started for free.
        </p>
      </section>
      <div className="flex justify-center gap-4 flex-wrap my-6">
        {pricingCards.map((card) => (
          <Card
            key={card.title}
            className={clsx("w-[300px] flex flex-col justify-between", {
              "border-2 border-primary": card.title === "Unlimited",
            })}
          >
            <CardHeader>
              <CardTitle className="text-orange">{card.title}</CardTitle>
              <CardDescription>{pricingCards.find((c) => c.title === card.title)?.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold">{card.price}</span>
              <span className="text-muted-foreground">
                <span>/ month</span>
              </span>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-4">
              <div>
                {card.features.map((feature) => (
                  <div key={feature} className="flex gap-2">
                    <Check />
                    <p>{feature}</p>
                  </div>
                ))}
              </div>
              <Link
                href={`/dashboard?plan=${card.title}`}
                className="bg-orange/50 border-orange border-2 p-2 w-full text-center font-bold rounded-md"
              >
                Get Started
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      {posts && <section className="flex justify-center items-center flex-col gap-4 mt-28">
        <h2 className="text-4xl text-center">News Room</h2>
        <p className="text-muted-foreground text-center max-w-lg">
          Explore our insights on AI, technology, and optiming your taxes.
        </p>
      </section>}
      <section className="md:grid-cols-3 grid-cols-1 grid gap-5 container">
        {posts &&
          posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <Card className="flex flex-col gap-2 rounded-xl overflow-hidden h-full hover:bg-gray-100">
                <div className="relative w-full aspect-video">
                  <Image
                    src={`${process.env.CLOUDWAYS_UPLOADS_URL}${post.image}`}
                    width={500}
                    height={300}
                    alt={post.title}
                    fill
                  />
                </div>
                <div className="py-5 px-10 flex flex-col gap-5">
                  <CardDescription>
                    {getMonthName(post.createdAt.getMonth())} {post.createdAt.getDate()} {post.createdAt.getDate()}{" "}
                    {post.createdAt.getFullYear()}
                  </CardDescription>
                  <CardTitle>{post.title}</CardTitle>
                  {parse(post.content.slice(4, 100))}...
                </div>
              </Card>
            </Link>
          ))}
      </section>
    </main>
  );
}
