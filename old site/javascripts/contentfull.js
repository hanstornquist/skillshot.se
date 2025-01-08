var client = contentful.createClient({
            // This is the space ID. A space is like a project folder in Contentful terms
            space: 'wjtxrzlaggpc',
            // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
            accessToken: 'c7372757d2177d2dfe09d2907887d44524e6729f2b8b42b3b3e4cd77e9c8a56e'
        });
        client.getEntries({
                'content_type': 'gigItem'
            })
            .then(function(entries) {
                // log the title for all the entries that have it
                entries.items.forEach(function(entry) {
                    if (entry.fields.title) {
                        console.log(entry.fields.title);
                    }
                });
            });