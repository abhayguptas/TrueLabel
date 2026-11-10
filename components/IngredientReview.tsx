import type { AnalyzeResult } from "@/lib/types";

const labels = { india_reference: "India reference", reference: "Cited reference", no_match: "No specific match" };

export function IngredientReview({ result }: { result: AnalyzeResult }): React.ReactElement {
  return <section className="ingredient-review"><div className="section-label"><span>Back-label ingredient review</span><span>Exact disclosed ingredients only</span></div>{result.ingredientReviews.length ? <div className="ingredient-review-list">{result.ingredientReviews.map((review) => <article key={review.ingredient} className={`ingredient-review-row ${review.status}`}><div><strong>{review.ingredient}</strong><span>{labels[review.status]}</span></div><p>{review.summary}</p>{review.source ? <a href={review.source.sourceUrl} target="_blank" rel="noreferrer">{review.source.publisher}: {review.source.title}</a> : <span className="no-match-note">Upload the back label or paste its ingredient list to check this ingredient against cited sources.</span>}</article>)}</div> : <div className="ingredient-review-empty"><strong>No verified ingredient list found.</strong><p>Paste the Ingredients section or upload a readable back-label image. TrueLabel will not invent ingredient facts from a front-label claim.</p></div>}</section>;
}
