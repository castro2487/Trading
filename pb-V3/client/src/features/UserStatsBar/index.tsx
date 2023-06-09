import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    border: "1px solid yellow",
    marginTop: "20px",
    marginBottom: "20px",
  },
}));

const UserStatsBar = () => {
  const styles = useStyles();
  return <div className={styles.wrapper}>User Stats Bar</div>;
};

export default UserStatsBar;
