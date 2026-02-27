"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Review } from "@/lib/data";

interface ProductReviewsProps {
    productId: string;
    productRating: number;
    initialReviews: Review[];
}

export function ProductReviews({ productId, productRating, initialReviews }: ProductReviewsProps) {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

    const calculateRatingBreakdown = () => {
        if (!reviews || reviews.length === 0) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const breakdown: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
        });
        return breakdown;
    };

    const ratingBreakdown = calculateRatingBreakdown();

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to write a review');
            return;
        }
        setSubmittingReview(true);
        try {
            await api.post(`/products/${productId}/reviews`, {
                rating,
                comment
            });

            const newReview: Review = {
                name: user.name || "User",
                rating,
                comment,
                createdAt: new Date().toISOString(),
                user: user.id || user._id
            };

            setReviews([...reviews, newReview]);
            setComment("");
            setRating(5);
            alert("Review submitted!");
        } catch (error: any) {
            console.error("Review fail", error);
            alert(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="max-w-2xl mt-16 pt-16 border-t border-border">
            <h2 className="font-display font-bold text-2xl mb-8">Customer Reviews</h2>

            {/* Rating Summary */}
            <div className="flex items-center gap-6 mb-8">
                <div className="text-center">
                    <p className="font-display text-5xl font-bold">
                        {productRating.toFixed(1)}
                    </p>
                    <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(productRating)
                                    ? "fill-foreground text-foreground"
                                    : "fill-muted text-muted"
                                    }`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {reviews.length} reviews
                    </p>
                </div>
                <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingBreakdown[star] || 0;
                        const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                            <div
                                key={star}
                                className="flex items-center gap-2 mb-1"
                            >
                                <span className="text-xs text-muted-foreground w-3">
                                    {star}
                                </span>
                                <Star className="w-3 h-3 fill-foreground text-foreground" />
                                <div className="flex-1 h-2 bg-secondary overflow-hidden">
                                    <div
                                        className="h-full bg-foreground"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground w-8 text-right">
                                    {Math.round(pct)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Write a Review */}
            {user ? (
                <div className="mb-10 p-6 bg-secondary/30 border border-border">
                    <h3 className="font-bold text-lg mb-4">Write a Review</h3>
                    <form onSubmit={handleSubmitReview}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setRating(s)}
                                        className="focus:outline-none"
                                    >
                                        <Star className={`w-6 h-6 ${s <= rating ? "fill-foreground text-foreground" : "text-muted-foreground"}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Comment</label>
                            <textarea
                                className="w-full p-3 border border-border bg-background"
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts..."
                                required
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={submittingReview}
                            className="px-6 py-2 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors disabled:opacity-50"
                        >
                            {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="mb-10 p-6 bg-secondary/30 border border-border text-center">
                    <p className="mb-4">Please login to write a review</p>
                    <Link href="/auth/login" className="px-6 py-2 bg-foreground text-background font-bold text-sm uppercase tracking-wider hover:bg-primary transition-colors">
                        Login
                    </Link>
                </div>
            )}

            {/* Reviews List */}
            <div className="divide-y divide-border">
                {reviews.length === 0 ? (
                    <p className="py-4 text-muted-foreground text-center">No reviews yet. Be the first to review!</p>
                ) : (
                    reviews.map((review, i) => (
                        <div key={i} className="py-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-display font-bold text-sm uppercase">
                                    {review.name ? review.name[0] : 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{review.name}</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, j) => (
                                                <Star
                                                    key={j}
                                                    className={`w-3 h-3 ${j < review.rating
                                                        ? "fill-foreground text-foreground"
                                                        : "fill-muted text-muted"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground ml-auto">
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recent'}
                                </span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    )))}
            </div>
        </div>
    );
}
