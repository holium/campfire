cd $URBIT_PATH/pkg 
#remove any previous runs
rm -r $URBIT_PATH/pkg/campfire
# symbolic merge to get the dependecies for campfire
./symbolic-merge.sh base-dev campfire
./symbolic-merge.sh garden-dev campfire

# remove the old desk so we can swap it with what's formed above
rm -r $SHIP_PATH/$SHIP/$DESK/
cp -rL $URBIT_PATH/pkg/campfire/ $SHIP_PATH/$SHIP/
cp -rL $REPO_PATH/campfire/urbit/* $SHIP_PATH/$SHIP/campfire/
cp -rL $REPO_PATH/icepond/* $SHIP_PATH/$SHIP/campfire/
cp -rL $REPO_PATH/rtcswitchboard/* $SHIP_PATH/$SHIP/campfire/

