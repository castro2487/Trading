import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    border: "1px solid blue",
    marginTop: "20px",
    marginBottom: "20px",
  },
}));

const PortfoliosToolbar = () => {
  const styles = useStyles();
  return <div className={styles.wrapper}>Portfolios Toolbar</div>;
};

export default PortfoliosToolbar;
