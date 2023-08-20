const phin = require('phin')
async function getForumPosts(p) {
	if (!p) return
	let userProfile = await phin("https://www.brick-hill.com/user/" + p.userId)
	//removes whitespace so it can remove everything else
	let string1 = userProfile.body.toString().replace(/\s/g, '')

	//removes most characters before forum post integer
	let string2 = string1.replace(/(.)*id="foru/m, '')

	//removes "," because it messes the result up if user has more than 999 posts
	let string3 = string2.replace(/,/g, '')
	
	//gets the forum post number
	let forumPosts = string3.match(/\d+/).shift();

	p.forumPosts = parseInt(forumPosts)
	return p.forumPosts
}

module.exports = getForumPosts