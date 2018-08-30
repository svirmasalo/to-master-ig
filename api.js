require('dotenv').config();
const express = require('express');
const Instagram = require('node-instagram').default;
const app = express();

// Create a new instance.
const instagram = new Instagram({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  accessToken: process.env.ACCESS_TOKEN
});

const redirectUri = 'http://localhost:8080/handleauth';

// First redirect user to instagram oauth
app.get('/igauth', (req, res) => {
  res.redirect(
    instagram.getAuthorizationUrl(
      redirectUri,
      {
        // an array of scopes
        scope: ['basic', 'likes', 'public_content'],
      }
    )
  );
});

// Handle auth code and get access_token for user
app.get('/handleauth', async (req, res) => {
  try {
    // The code from the request, here req.query.code for express
    const code = req.query.code;
    const data = await instagram.authorizeUser(code, redirectUri);
    // data.access_token contain the user access_token
    res.json(data);
  } catch (err) {
    res.json(err);
  }
});

const countLikes = posts => {
	let likesTotal = 0;
	for (let p of posts) {likesTotal = likesTotal + p.likes.count;}
	return likesTotal;
}

const countComments = posts => {
	let commentsTotal = 0;
	for (let p of posts) {commentsTotal = commentsTotal + p.comments.count;}
	return commentsTotal;
}

const likedMTAverage = (posts, average) => {
	const aboveAverage = posts.filter(post => post.likes.count > average);
	const postsSorted = aboveAverage.sort((a,b) => b.likes.count - a.likes.count);
	return postsSorted;
}

const likedLTAverage = (posts, average) => {
	const underAverage = posts.filter(post => post.likes.count < average);
	const postsSorted = underAverage.sort((a,b) => a.likes.count - b.likes.count);
	return postsSorted;
}

const postsLikedMTAverage = posts => {
	return posts.map(post => post.caption.text);
}

const postsLikedLTAverage = posts => {
	return posts.map(post => post.caption.text);
}

const timesAboveAverage = posts => {
	return posts.map(post => {
		return `${new Date(1000 * parseFloat(post.created_time)).toLocaleTimeString('fi')} - ${post.likes.count}`;
	});
}

const timesUnderAverage = posts => {
	return posts.map(post => {
		return `${new Date(1000 * parseFloat(post.created_time)).toLocaleTimeString('fi')} - ${post.likes.count}`;
	});
}

const average = (type, length) => {
	return type / length;
}

const likeData = posts => {
	const totalPosts = posts.length;
	const totalLikes = countLikes(posts);
	const totalComments = countComments(posts);
	const averageLikes = average(totalLikes, totalPosts);
	const averageComments = average(totalComments, totalPosts);
	const likedOverAverage = likedMTAverage(posts, averageLikes);
	const likedUnderAverage = likedLTAverage(posts, averageLikes);
	const likedOverAverageTimes = timesAboveAverage(likedOverAverage);
	const likedUnderAverageTimes = timesUnderAverage(likedUnderAverage);
	const postsLikedOverAverage = postsLikedMTAverage(likedOverAverage);
	const postsLikedUnderAverage = postsLikedLTAverage(likedUnderAverage);

	const likeDataSchema = {
		totalPosts,
		likes: {
			total: totalLikes,
			average: averageLikes
		},
		comments: {
			total: totalComments,
			average: averageComments
		},
		best_practises: {
			likes_over_avarage: {
				posts_count: likedOverAverage.length,
				posting_times_to_likes: likedOverAverageTimes,
			}
		},
		worst_practises: {
			likes_under_average: {
				posts_count: likedUnderAverage.length,
				posting_times_to_likes: likedUnderAverageTimes
			}
		},
		posts: {
			most_liked: postsLikedOverAverage,
			least_liked: postsLikedUnderAverage
		}
	};
	return likeDataSchema;
};

app.get('/recent', async (req,res) => {
	instagram.get('users/self/media/recent').then(data => {
		res.json(likeData(data.data));
		// All
		// res.json(data);
	}).catch(err => {
		res.json(err);
	})
});

const port = process.env.PORT || 8080;
app.listen(port,  () => console.log(`Example app listening on port ${port}!`));