import chalk from "chalk";

export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((error) => {
            console.log(chalk.red('Error occurred:'), error);

            res.status(500).json(chalk.red('An unexpected error occurred.'));
        });
    };
}