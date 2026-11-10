import type { AnalyzeResult } from "@/lib/types";
import { ExternalLink, CheckCircle2 } from "lucide-react";

const labels = {
  india_reference: "Official Indian Standard",
  reference: "Scientific Knowledge Base",
  no_match: "Packaging Fact"
};

export function IngredientReview({ result }: { result: AnalyzeResult }): React.ReactElement {
  return (
    <section className="ingredient-review">
      <div className="section-label">
        <span>Back-Label Ingredient Breakdown ({result.ingredients.length} items)</span>
        <span>Exact Disclosed Ingredients</span>
      </div>
      {result.ingredientReviews.length ? (
        <div className="ingredient-review-list">
          {result.ingredientReviews.map((review) => (
            <article key={review.ingredient} className={`ingredient-review-row ${review.status}`}>
              <div>
                <strong>{review.ingredient}</strong>
                <span>{labels[review.status]}</span>
              </div>
              <p>{review.summary}</p>
              {review.source ? (
                <a href={review.source.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={12} className="inline-icon" /> {review.source.publisher}: {review.source.title}
                </a>
              ) : (
                <span className="no-match-note">
                  <CheckCircle2 size={11} className="inline-icon" /> Disclosed on product back label.
                </span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="ingredient-review-empty">
          <strong>No back-label ingredient list found.</strong>
          <p>
            Paste the Ingredients text or upload a clear back-label photo to inspect what is actually inside this product.
          </p>
        </div>
      )}
    </section>
  );
}
