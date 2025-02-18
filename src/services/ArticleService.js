import axios from "axios";
import {backendAPI, defaultError} from "../config.json";
import UserService from "./UserService";

export class ArticleService {
	BASE_URL = "article/v1/articles";

	static buildArticleURL(article) {
		return article.title
			.replace(/[^A-Za-z0-9 ]/g, "")
			.replace(/\s/g, "-")
			.toLowerCase();
	}

	static buildArticleRichResult(article) {
		return {
			"@context": "https://schema.org",
			"@type": "Article",
			"headline": article.title,
			"datePublished": new Date(article.createdOn).toISOString(),
			"dateModified": new Date(article.updatedOn).toISOString(),
			"author": UserService.buildProfileRichResult(article.createdBy),
			"publisher": {
				"@type": "Organization",
				"name": "CodeSupport",
				"logo": {
					"@type": "ImageObject",
					"url": "https://codesupport.dev/logo.png"
				}
			}
		};
	}

	static formatArticleDate(input) {
		const date = new Date(input).toString().split(" ");

		return `${date[2]} ${date[1]} ${date[3]}`;
	}

	async getAllArticles() {
		try {
			const { data } = await axios.get(`${backendAPI}/${this.BASE_URL}?publishedonly=true`);

			return data.response.map(article => ({
				...article,
				createdOn: ArticleService.formatArticleDate(+article.createdOn),
				updatedOn: ArticleService.formatArticleDate(+article.updatedOn),
				path: ArticleService.buildArticleURL(article)
			}));
		} catch ({ message }) {
			console.error(message);
		}

		return [];
	}

	async getAllArticlesByUser(userId) {
		try {
			const { data } = await axios.get(`${backendAPI}/${this.BASE_URL}?creatorId=${userId}`);

			return data.response.map(article => ({
				...article,
				createdOn: ArticleService.formatArticleDate(+article.createdOn),
				updatedOn: ArticleService.formatArticleDate(+article.updatedOn),
				path: ArticleService.buildArticleURL(article)
			}));
		} catch ({ response }) {
			throw new Error(response?.data?.message ?? defaultError);
		}
	}
	async getAllPublishedArticlesByUser(userId) {
		try {
			const { data } = await axios.get(`${backendAPI}/${this.BASE_URL}?publishedonly=true&creatorId=${userId}`);

			return data.response.map(article => ({
				...article,
				createdOn: ArticleService.formatArticleDate(+article.createdOn),
				updatedOn: ArticleService.formatArticleDate(+article.updatedOn),
				path: ArticleService.buildArticleURL(article)
			}));
		} catch ({ response }) {
			throw new Error(response?.data?.message ?? defaultError);
		}
	}

	async getArticleById(id) {
		try {
			const { data } = await axios.get(`${backendAPI}/${this.BASE_URL}/${id}`);
			const [article] = data.response;

			return {
				...article,
				createdOn: ArticleService.formatArticleDate(+article.createdOn),
				updatedOn: ArticleService.formatArticleDate(+article.updatedOn),
				path: ArticleService.buildArticleURL(article)
			};
		} catch ({ message }) {
			console.error(message);
		}

		return {};
	}

	async createArticle(title) {
		try {
			const { data } = await axios.post(`${backendAPI}/${this.BASE_URL}`, {
				title
			});

			return data;
		} catch ({ response }) {
			throw new Error(response?.data?.message ?? defaultError);
		}
	}

	async getArticleRevisions(id) {
		try {
			const { data } = await axios.get(`${backendAPI}/${this.BASE_URL}/${id}/revisions`);

			return data.response.map(revision => ({
				...revision,
				createdOn: ArticleService.formatArticleDate(+revision.createdOn)
			}));
		} catch ({ response }) {
			throw new Error(response?.data?.message ?? defaultError);
		}
	}
}

export default ArticleService;