#!bun

# pkg=$1
pkg=limits

mkdir packages/@sflow/$pkg

cp $pkg*.ts packages/@sflow/$pkg

# echo export * from "$pkg.ts"
# cp ./package.json 
