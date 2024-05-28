const User = require("../models/UserModel");
const { UserListSchema, CategorySchema, PostSchema } = require("../models/UserList");
const shortLink = require("shortlink");
const InfoQuestQuestions = require("../models/InfoQuestQuestions");
const StartQuests = require("../models/StartQuests");

// User's List APIs

const userList = async (req, res) => {
    try {

        const userUuid = req.params.userUuid;
        const categoryName = req.query.categoryName;

        if (categoryName) {
            const userList = await UserListSchema.findOne({ userUuid: userUuid })
                .populate({
                    path: 'list.post.questForeginKey',
                    model: 'InfoQuestQuestions'
                });
            if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

            // Find all categories within the list array that contain categoryName substring
            const categories = userList.list.filter(obj => {
                const regex = new RegExp(categoryName, 'i'); // 'i' flag for case-insensitive match
                return regex.test(obj.category);
            });

            if (categories.length === 0) {
                res.status(200).json({
                    message: "No Category found.",
                    userList: [],
                });
            }
            else {
                res.status(200).json({
                    message: `Categories found successfully`,
                    userList: categories,
                });
            }

        } else {
            const userList = await UserListSchema.findOne({ userUuid: userUuid })
                .populate({
                    path: 'list.post.questForeginKey',
                    model: 'InfoQuestQuestions'
                });
            if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

            res.status(200).json({
                message: "List found successfully.",
                userList: userList.list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            });
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const addCategoryInUserList = async (req, res) => {
    try {
        const { userUuid, category } = req.body;

        const userList = await UserListSchema.findOne({
            userUuid: userUuid
        })
        if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

        // Check if userList already has a category with the same name
        const categoryExists = userList.list.some(obj => obj.category === category);
        if (categoryExists) throw new Error(`Category: ${category}, Already exists in the user list.`);

        const newCategory = new CategorySchema({
            category: category,
        });
        userList.list.push(newCategory)

        userList.updatedAt = new Date().toISOString();
        await userList.save();

        const populatedUserList = await UserListSchema.findOne({ userUuid: userUuid })
            .populate({
                path: 'list.post.questForeginKey',
                model: 'InfoQuestQuestions'
            });

        res.status(200).json({
            message: "New category is created successfully.",
            userList: populatedUserList.list,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const findCategoryById = async (req, res) => {
    try {

        const { userUuid, categoryId } = req.params;

        const userList = await UserListSchema.findOne({ userUuid: userUuid })
            .populate({
                path: 'list.post.questForeginKey',
                model: 'InfoQuestQuestions'
            });
        if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

        // Find the category within the list array based on categoryId
        const categoryDoc = userList.list.id(categoryId);
        if (!categoryDoc) throw new Error('Category not found');

        res.status(200).json({
            message: `Category found successfully`,
            userList: categoryDoc,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const findCategoryByName = async (req, res) => {
    try {

        const { userUuid, categoryName } = req.params;

        const userList = await UserListSchema.findOne({ userUuid: userUuid })
            .populate({
                path: 'list.post.questForeginKey',
                model: 'InfoQuestQuestions'
            });
        if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

        // Find all categories within the list array that contain categoryName substring
        const categories = userList.list.filter(obj => {
            const regex = new RegExp(categoryName, 'i'); // 'i' flag for case-insensitive match
            return regex.test(obj.category);
        });

        if (categories.length === 0) throw new Error('No categories found');

        res.status(200).json({
            message: `Categories found successfully`,
            categories: categories,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const updateCategoryInUserList = async (req, res) => {
    try {

        const { userUuid, categoryId } = req.params;
        const postId = req.query.postId;
        const category = req.body.category;

        if (!postId && !category || postId && category) throw new Error("Bad Request: Please Provide either category in your request, or postId in query");

        // Find UserList Document
        const userList = await UserListSchema.findOne({ userUuid: userUuid })
            .populate({
                path: 'list.post.questForeginKey',
                model: 'InfoQuestQuestions'
            });
        if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

        // Find the document in the list array by categoryId
        const categoryDoc = userList.list.id(categoryId);
        if (!categoryDoc) throw new Error('Category not found');

        // Delete Post Or Update Category Only.
        if (postId) categoryDoc.post.pull({ _id: postId });
        if (category) {
            // Check if userList already has a category with the same name
            const categoryExists = userList.list.some(obj => obj.category === category);
            if (categoryExists) throw new Error(`Category: ${category}, Already exists in the user list.`);
            categoryDoc.category = category;
        }

        categoryDoc.updatedAt = new Date().toISOString();
        userList.updatedAt = new Date().toISOString();
        // Save the updated userList document
        await userList.save();

        res.status(200).json({
            message: `Category found successfully`,
            userList: categoryDoc,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const deleteCategoryFromList = async (req, res) => {
    try {
        const { userUuid, categoryId } = req.params;

        // Find UserList Document
        const userList = await UserListSchema.findOne({ userUuid: userUuid })
            .populate({
                path: 'list.post.questForeginKey',
                model: 'InfoQuestQuestions'
            });
        if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

        userList.list.pull({ _id: categoryId });
        userList.updatedAt = new Date().toISOString();
        // Save the updated userList document
        await userList.save();

        res.status(200).json({
            message: "New category is created successfully.",
            userList: userList.list,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: `An error occurred: ${error.message}` });
    }
};

const generateCategoryShareLink = async (req, res) => {
    try {

        const { userUuid, categoryId } = req.params;
        const customizedLink = req.query.customizedLink;

        // Check if customizedLink contains any spaces or periods
        if (customizedLink && /[\s.]/.test(customizedLink)) throw new Error('Customized link should not contain spaces or periods');

        const userList = await UserListSchema.findOne({ userUuid: userUuid })
        // .populate({
        //     path: 'list.post.questForeginKey',
        //     model: 'InfoQuestQuestions'
        // });
        if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

        // Find the category within the list array based on categoryId
        const categoryDoc = userList.list.id(categoryId);
        if (!categoryDoc) throw new Error('Category not found');

        if (customizedLink && categoryDoc.isLinkUserCustomized) throw new Error("Link can be customized only once.")

        if (categoryDoc.link === null || !categoryDoc.isLinkUserCustomized) {
            if (customizedLink) {
                categoryDoc.link = customizedLink;
                categoryDoc.isLinkUserCustomized = true;
            }
            else {
                categoryDoc.link = shortLink.generate(8);
            }

            categoryDoc.updatedAt = new Date().toISOString();
            userList.updatedAt = new Date().toISOString();
            await userList.save();
        }

        res.status(200).json({
            message: `Here is Share Link for ${categoryDoc.category}.`,
            link: categoryDoc.link,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const findCategoryByLink = async (req, res) => {
    try {

        const { categoryLink } = req.params;
        const { uuid } = req.query;

        // Find the user list that contains a category with the given link
        const userList = await UserListSchema.findOne({
            'list.link': categoryLink
        }).populate({
            path: 'list.post.questForeginKey',
            model: 'InfoQuestQuestions'
        });

        if (!userList) throw new Error(`No list is found with the category link: ${categoryLink}`);

        // Find the category within the list array based on the category link
        const categoryDoc = userList.list.find(obj => obj.link === categoryLink);
        if (!categoryDoc) throw new Error('Category not found');

        if (uuid) {
            const questForeignKeys = categoryDoc.post.map(post => post.questForeginKey._id);
            let startQuestData;
            if (uuid && questForeignKeys.length > 0) {
                startQuestData = await StartQuests.find({
                    uuid: uuid,
                    questForeignKey: { $in: questForeignKeys }
                });

                if (startQuestData.length === 0) {
                    throw new Error("Please submit a response");
                }
            }

            // Create a map for quick lookup of startQuestData by questForeignKey
            const startQuestDataMap = startQuestData.reduce((map, data) => {
                map[data.questForeignKey.toString()] = data;
                return map;
            }, {});

            // Add the startQuestData field to each post
            const updatedPosts = categoryDoc.post.map(post => {
                const questForeignKey = post.questForeginKey._id.toString();
                let updatedPost = {
                    ...post.toObject(), // Convert Mongoose document to plain JS object
                    startQuestData: startQuestDataMap[questForeignKey] || null
                };
                return updatedPost
            });

            const newCategoryDoc = {
                category: categoryDoc.category,
                post: updatedPosts,
                link: categoryDoc.link,
                isLinkUserCustomized: categoryDoc.isLinkUserCustomized,
                clicks: categoryDoc.clicks,
                participents: categoryDoc.participents,
                createdAt: categoryDoc.createdAt,
                updatedAt: categoryDoc.updatedAt,
                deletedAt: categoryDoc.deletedAt,
                isActive: categoryDoc.isActive,
                _id: categoryDoc._id
            };

            res.status(200).json({
                message: `Category found successfully`,
                category: newCategoryDoc,
            });

        }
        else {

            res.status(200).json({
                message: `Category found successfully`,
                category: categoryDoc,
            });

        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const categoryViewCount = async (req, res) => {
    try {

        const { categoryLink } = req.params;

        // Find the user list that contains a category with the given link
        const userList = await UserListSchema.findOne({
            'list.link': categoryLink
        }).populate({
            path: 'list.post.questForeginKey',
            model: 'InfoQuestQuestions'
        });

        if (!userList) throw new Error(`No list is found with the category link: ${categoryLink}`);

        // Find the category within the list array based on the category link
        const categoryDoc = userList.list.find(obj => obj.link === categoryLink);
        if (!categoryDoc) throw new Error('Category not found');


        if (categoryDoc.clicks === null) {
            categoryDoc.clicks = 1;
        }
        else {
            categoryDoc.clicks = categoryDoc.clicks + 1;
        }

        categoryDoc.updatedAt = new Date().toISOString();
        userList.updatedAt = new Date().toISOString();
        await userList.save();

        res.status(200).json({
            message: `Category View Count found successfully`,
            categoryViewCount: categoryDoc.clicks,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const categoryParticipentsCount = async (req, res) => {
    try {

        const { categoryLink } = req.params;

        // Find the user list that contains a category with the given link
        const userList = await UserListSchema.findOne({
            'list.link': categoryLink
        }).populate({
            path: 'list.post.questForeginKey',
            model: 'InfoQuestQuestions'
        });

        if (!userList) throw new Error(`No list is found with the category link: ${categoryLink}`);

        // Find the category within the list array based on the category link
        const categoryDoc = userList.list.find(obj => obj.link === categoryLink);
        if (!categoryDoc) throw new Error('Category not found');


        if (categoryDoc.participents === null) {
            categoryDoc.participents = 1;
        }
        else {
            categoryDoc.participents = categoryDoc.participents + 1;
        }

        categoryDoc.updatedAt = new Date().toISOString();
        userList.updatedAt = new Date().toISOString();
        await userList.save();

        res.status(200).json({
            message: `Category Participents Count found successfully`,
            categoryParticipentsCount: categoryDoc.participents,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const categoryStatistics = async (req, res) => {
    try {

        const { categoryLink } = req.params;

        // Find the user list that contains a category with the given link
        const userList = await UserListSchema.findOne({
            'list.link': categoryLink
        }).populate({
            path: 'list.post.questForeginKey',
            model: 'InfoQuestQuestions'
        });

        if (!userList) throw new Error(`No list is found with the category link: ${categoryLink}`);

        // Find the category within the list array based on the category link
        const categoryDoc = userList.list.find(obj => obj.link === categoryLink);
        if (!categoryDoc) throw new Error('Category not found');
        res.status(200).json({
            message: `Category Statistics found successfully`,
            categoryViewCount: categoryDoc.clicks,
            categoryParticipentsCount: categoryDoc.participents,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const addPostInCategoryInUserList = async (req, res) => {
    try {
        const { userUuid, categoryIdArray, questForeginKey } = req.body;

        // Find UserList Document
        const userList = await UserListSchema.findOne({
            userUuid: userUuid
        })
        if (!userList) throw new Error(`No list is found for User: ${userUuid}`);

        let categoryDoc;
        for (const categoryId of categoryIdArray) {
            categoryDoc = userList.list.id(categoryId);
            if (!categoryDoc) {
                return res.status(404).json({ message: `Category not found: ${categoryId}` });
            }

            const questForeginKeyExists = categoryDoc.post.some(obj => obj.questForeginKey.equals(questForeginKey));
            if (questForeginKeyExists) continue;

            const newPost = new PostSchema({
                questForeginKey: questForeginKey
            });
            categoryDoc.post.push(newPost);
        }
        userList.updatedAt = new Date().toISOString();

        await userList.save();

        const populatedUserList = await UserListSchema.findOne({ userUuid: userUuid })
            .populate({
                path: 'list.post.questForeginKey',
                model: 'InfoQuestQuestions'
            });

        res.status(200).json({
            message: `Post is added successfully into your category: ${categoryDoc.category}`,
            userList: populatedUserList.list,
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while getting the userList: ${error.message}`,
        });
    }
}

const createUserListForAllUsers = async (req, res) => {
    try {
        // Fetch all users from the users collection
        const users = await User.find({});

        // Array to store promises for creating userlists
        const userListPromises = [];

        // Iterate over each user
        for (const user of users) {
            // Check if a userList already exists for the user
            const existingUserList = await UserListSchema.findOne({ userUuid: user.uuid });

            // If userList does not exist for the user, create one
            if (!existingUserList) {
                const userList = new UserListSchema({
                    userUuid: user.uuid,
                    // Other fields will default as per the schema
                });

                // Save the userList and push the promise to the array
                userListPromises.push(userList.save());
            }
        }

        // Wait for all userlist documents to be created
        const result = await Promise.all(userListPromises);

        // Send success response
        res.status(200).json({
            message: 'UserList Collection is Refactored successfully',
            userList: result,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: `An error occurred while creating the userList: ${error.message}`,
        });
    }
}

module.exports = {
    userList,
    addCategoryInUserList,
    findCategoryById,
    findCategoryByName,
    updateCategoryInUserList,
    deleteCategoryFromList,
    generateCategoryShareLink,
    findCategoryByLink,
    categoryViewCount,
    categoryParticipentsCount,
    categoryStatistics,
    addPostInCategoryInUserList,
    createUserListForAllUsers,
};