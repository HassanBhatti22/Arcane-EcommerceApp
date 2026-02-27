"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, ThumbsUp, MessageSquare } from "lucide-react";
import api from "@/lib/api";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating
            ? "fill-foreground text-foreground"
            : "fill-muted text-muted"
            }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/auth/reviews');
        setReviews(response.data);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl lg:text-4xl font-bold mb-2">
        My Reviews
      </h1>
      <p className="text-muted-foreground mb-8">
        {reviews.length} {reviews.length === 1 ? "review" : "reviews"} written.
      </p>

      {isLoading ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-display font-bold text-lg mb-1">
            No reviews yet
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Share your experience with products you have purchased.
          </p>
          <Link
            href="/account/orders"
            className="inline-block px-8 py-3.5 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors"
          >
            View Past Orders
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-border hover:border-foreground/30 transition-colors p-5"
            >
              <div className="flex gap-4">
                {/* Product Image */}
                <Link
                  href={`/product/${review.productId}`}
                  className="relative w-16 h-20 bg-secondary flex-shrink-0"
                >
                  <Image
                    src={review.productImage || "/placeholder.svg"}
                    alt={review.productName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  {/* Product Info */}
                  <Link
                    href={`/product/${review.productId}`}
                    className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
                  >
                    {review.productName}
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mt-1 mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Review Content */}
                  {/* <h3 className="font-bold text-sm mb-1">{review.title}</h3> */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Helpful */}
                  {/* <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ThumbsUp className="w-3 h-3" />
                      {review.helpful} found this helpful
                    </span>
                    <button className="text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                      Edit
                    </button>
                    <button className="text-xs font-bold uppercase tracking-wider text-destructive hover:text-destructive/80 transition-colors">
                      Delete
                    </button>
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
