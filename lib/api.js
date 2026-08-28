const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

export async function fetchAPI(query, { variables } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  // Debugging logs to see exactly what is happening on the server
  console.log("🔌 API_URL IS:", API_URL);
  console.log("📡 Variables sent to WP:", variables);

  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    cache: 'no-store', // This forces Next.js to ignore cached 404s
  });

  const json = await res.json();
  
  if (json.errors) {
    console.error("❌ GraphQL Errors:", JSON.stringify(json.errors, null, 2));
    throw new Error('Failed to fetch API');
  }
  
  return json.data;
}

// 1. Homepage posts (Includes reviewScore for badges)
export async function getLatestPosts(afterCursor = "") {
  const data = await fetchAPI(`
    query AllPosts($first: Int!, $after: String) {
      posts(first: $first, after: $after, where: { orderby: { field: DATE, order: DESC } }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            excerpt
            slug
            featuredImage {
              node {
                sourceUrl
              }
            }
            reviewDetails {
              reviewScore
            }
          }
        }
      }
    }
  `, {
    variables: { first: 7, after: afterCursor }
  });
  return data?.posts;
}

// 2. Single Article (Includes reviewScore and author)
export async function getPostBySlug(slug) {
  const data = await fetchAPI(`
    query GetPostBySlug($id: ID!) {
      post(id: $id, idType: SLUG) {
        title
        excerpt
        content
        date
        featuredImage {
          node {
            sourceUrl
          }
        }
        author {
          node {
            name
          }
        }
        reviewDetails {
          reviewScore
        }
      }
    }
  `, {
    variables: { id: slug }
  });
  return data?.post;
}

// 3. Category Archive (Supports pagination "Load More")
export async function getCategoryBySlug(slug, after = "") {
  const data = await fetchAPI(`
    query GetCategoryBySlug($id: ID!, $after: String) {
      category(id: $id, idType: SLUG) {
        name
        description
        posts(first: 12, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              slug
              excerpt
              featuredImage {
                node {
                  sourceUrl
                }
              }
              reviewDetails {
                reviewScore
              }
            }
          }
        }
      }
    }
  `, {
    variables: { id: slug, after }
  });
  
  return data?.category;
}

// 4. Static Pages (Terms, Privacy, Contact)
export async function getPageByUri(uri) {
  const data = await fetchAPI(`
    query GetPageByUri($uri: ID!) {
      page(id: $uri, idType: URI) {
        title
        content
      }
    }
  `, {
    variables: { uri }
  });
  return data?.page;
}

// 5. Sitemap fetch (Gets up to 1000 slugs lightly)
export async function getAllPostsForSitemap() {
  const data = await fetchAPI(`
    query AllPostsForSitemap {
      posts(first: 1000, where: { orderby: { field: DATE, order: DESC } }) {
        edges {
          node {
            slug
            modified
          }
        }
      }
    }
  `);
  return data?.posts;
}