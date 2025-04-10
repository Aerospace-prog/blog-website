import type { CollectionEntry } from 'astro:content';

export function findRelatedPosts(
    currentPost: CollectionEntry<'posts'>,
    allPosts: CollectionEntry<'posts'>[],
    maxPosts: number = 4
): CollectionEntry<'posts'>[] {
    // Filter out the current post and draft posts in production
    const otherPosts = allPosts.filter(post => 
        post.id !== currentPost.id && 
        (import.meta.env.PROD ? post.data.draft !== true : true)
    );

    // Calculate relevance score for each post
    const scoredPosts = otherPosts.map(post => {
        let score = 0;
        
        // Score based on matching tags
        const currentTags = new Set(currentPost.data.tags || []);
        (post.data.tags || []).forEach(tag => {
            if (currentTags.has(tag)) {
                score += 2; // Tags are weighted more heavily
            }
        });

        // Score based on matching category
        if (post.data.category === currentPost.data.category) {
            score += 3; // Category match is weighted most heavily
        }

        return { post, score };
    });

    // Sort by score (highest first) and get top N posts
    return scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, maxPosts)
        .filter(item => item.score > 0) // Only include posts with some relevance
        .map(item => item.post);
} 